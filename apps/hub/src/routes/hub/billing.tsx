import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useViewer } from "@/components/viewer-context";
import { convertToTrv, confirmPreviewOnramp, getBilling, inviteOrgSeat, startStripeOnramp, subscribePlan } from "@/lib/trv/server";
import { formatSol, usdToSolMicro, type OnrampDest } from "@/lib/trv/onramp";
import { isUnlocked } from "@/lib/trv/wallet-client";
import {
  ALL_PLANS,
  COMPANY_PLANS,
  PEOPLE_PLANS,
  USD_TO_TRV,
  planById,
  planPriceUsd,
  usdToCredits,
  type BillingInterval,
  type Edition,
} from "@/lib/trv/saas";
import type { InvoiceRow, OrgSnapshot, ViewerProfile } from "@/lib/trv/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type BillingSearch = { plan?: string; edition?: Edition };

export const Route = createFileRoute("/hub/billing")({
  validateSearch: (s: Record<string, unknown>): BillingSearch => ({
    plan: typeof s.plan === "string" ? s.plan : undefined,
    edition: s.edition === "company" ? "company" : s.edition === "people" ? "people" : undefined,
  }),
  component: BillingPage,
});

function BillingPage() {
  const search = Route.useSearch();
  const { profile, setProfile } = useViewer();
  const [edition, setEdition] = useState<Edition>(search.edition ?? "people");
  const [planId, setPlanId] = useState(search.plan ?? "verified");
  const [interval, setInterval] = useState<BillingInterval>("month");
  const [usd, setUsd] = useState(100);
  const [rail, setRail] = useState("ach");
  const [orgName, setOrgName] = useState("");
  const [invite, setInvite] = useState("");
  const [busy, setBusy] = useState(false);
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [org, setOrg] = useState<OrgSnapshot | null>(null);
  const [feeRate, setFeeRate] = useState(0.08);
  const [dest, setDest] = useState<OnrampDest>("trv");
  const [stripeOpen, setStripeOpen] = useState(false);
  const [stripeUsd, setStripeUsd] = useState(40);

  const plans = edition === "people" ? PEOPLE_PLANS : COMPANY_PLANS;
  const selected = useMemo(() => planById(planId), [planId]);
  const dueUsd = planPriceUsd(selected, interval);
  const dueTrv = usdToCredits(selected.usdMonth, interval);

  useEffect(() => {
    if (search.edition) setEdition(search.edition);
    if (search.plan) {
      setPlanId(search.plan);
      const p = planById(search.plan);
      setEdition(p.edition);
    }
  }, [search.edition, search.plan]);

  useEffect(() => {
    void getBilling()
      .then((b) => {
        setInvoices(b.invoices);
        setOrg(b.org);
        setFeeRate(b.feeRate);
        if (b.profile) setProfile(b.profile);
        if (!search.plan && b.profile?.planId) setPlanId(b.profile.planId);
        if (!search.edition && b.profile?.edition) setEdition(b.profile.edition);
      })
      .catch(() => {});
  }, [search.plan, search.edition, setProfile]);

  async function convert() {
    setBusy(true);
    try {
      const r = await convertToTrv({ data: { usd, rail } });
      if (r.profile) setProfile(r.profile);
      toast.success(`Converted $${usd} → ${r.credits} TRV on the native ledger.`);
      const b = await getBilling();
      setInvoices(b.invoices);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Convert failed");
    } finally {
      setBusy(false);
    }
  }

  async function subscribe() {
    setBusy(true);
    try {
      const r = await subscribePlan({
        data: { planId: selected.id, interval, orgName },
      });
      if (r.profile) setProfile(r.profile as ViewerProfile);
      toast.success(
        selected.usdMonth === 0
          ? "Initiate restored."
          : `Subscribed to ${selected.name}. ${r.charged} TRV sealed.`,
      );
      const b = await getBilling();
      setInvoices(b.invoices);
      setOrg(b.org);
      setFeeRate(b.feeRate);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Subscribe failed");
    } finally {
      setBusy(false);
    }
  }

  async function inviteSeat() {
    setBusy(true);
    try {
      const b = await inviteOrgSeat({ data: invite });
      setOrg(b.org);
      toast.success(`Seat granted to ${invite}.`);
      setInvite("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Invite failed");
    } finally {
      setBusy(false);
    }
  }

  async function stripeStart() {
    if (dest === "sol" && !isUnlocked() && !live?.phantomPubkey) {
      toast.error("Unlock your native wallet or connect Phantom before SOL.");
      return;
    }
    setBusy(true);
    try {
      const r = await startStripeOnramp({
        data: { usd: stripeUsd, dest, origin: window.location.origin },
      });
      if (r.mode === "stripe" && r.url) {
        window.location.assign(r.url);
        return;
      }
      setStripeOpen(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Stripe unavailable");
    } finally {
      setBusy(false);
    }
  }

  async function stripePreviewConfirm() {
    setBusy(true);
    try {
      const r = await confirmPreviewOnramp({ data: { usd: stripeUsd, dest } });
      if (r.profile) setProfile(r.profile);
      toast.success(
        dest === "sol"
          ? `Stripe preview → ${formatSol(usdToSolMicro(stripeUsd))} SOL`
          : `Stripe preview → ${usdToCredits(stripeUsd)} TRV`,
      );
      setStripeOpen(false);
      const b = await getBilling();
      setInvoices(b.invoices);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Settle failed");
    } finally {
      setBusy(false);
    }
  }

  const live = profile;

  return (
    <div className="space-y-8 p-5 md:p-8">
      <div>
        <p className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground">SaaS</p>
        <h1 className="mt-1 font-display text-3xl">Billing</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Convert FDIC-backed currency or Stripe (optional rail) into native TRV
          or SOL. Stripe is never identity. Wallet PIN is the default unlock.
          Handshake still gates Gateway methods.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge>{live?.edition === "company" ? "Company" : "We The People"}</Badge>
          <Badge variant="muted">{planById(live?.planId).name}</Badge>
          <Badge variant="muted">{Math.round(feeRate * 100)}% mint fee</Badge>
          <Badge variant="native">{live?.credits ?? 0} TRV</Badge>
          <Badge variant="muted">{formatSol(live?.solMicro ?? 0)} SOL</Badge>
        </div>
      </div>

      <section className="rounded-[var(--radius-xl)] border border-border bg-card p-5">
        <h2 className="font-display text-xl">Convert to native TRV</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {USD_TO_TRV} TRV per USD. Rails are recorded on-ledger. In this preview
          the conversion credits the node immediately — it is not a live bank ACH.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div>
            <Label htmlFor="usd">USD</Label>
            <Input
              id="usd"
              className="mt-1.5"
              type="number"
              min={1}
              value={usd}
              onChange={(e) => setUsd(Number(e.target.value) || 0)}
            />
          </div>
          <div>
            <Label>Rail</Label>
            <div className="mt-1.5 grid grid-cols-4 gap-1">
              {["ach", "wire", "debit", "cash"].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRail(r)}
                  className={cn(
                    "h-11 rounded-[var(--radius-sm)] border text-xs uppercase",
                    rail === r ? "border-accent bg-elevated" : "border-border text-muted-foreground",
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col justify-end">
            <p className="mb-2 font-mono text-sm tabular-nums text-muted-foreground">
              {usdToCredits(usd)} TRV
            </p>
            <Button onClick={() => void convert()} disabled={busy || usd < 1}>
              Convert
            </Button>
          </div>
        </div>
      </section>

      <section className="rounded-[var(--radius-xl)] border border-border bg-card p-5">
        <h2 className="font-display text-xl">Stripe on-ramp</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          Optional USD rail — not the lock, not a backdoor. Live Stripe Checkout
          is used when keys are present. This preview never collects card
          numbers. Destination: native TRV (default) or SOL toward Phantom.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div>
            <Label htmlFor="susd">USD</Label>
            <Input
              id="susd"
              className="mt-1.5"
              type="number"
              min={1}
              value={stripeUsd}
              onChange={(e) => setStripeUsd(Number(e.target.value) || 0)}
            />
          </div>
          <div>
            <Label>Destination</Label>
            <div className="mt-1.5 grid grid-cols-2 gap-1">
              {(["trv", "sol"] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDest(d)}
                  className={cn(
                    "h-11 rounded-[var(--radius-sm)] border text-xs uppercase",
                    dest === d ? "border-accent bg-elevated" : "border-border text-muted-foreground",
                  )}
                >
                  {d === "trv" ? "TRV credits" : "SOL / Phantom"}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col justify-end">
            <p className="mb-2 font-mono text-sm tabular-nums text-muted-foreground">
              {dest === "sol" ? `${formatSol(usdToSolMicro(stripeUsd))} SOL` : `${usdToCredits(stripeUsd)} TRV`}
            </p>
            <Button onClick={() => void stripeStart()} disabled={busy || stripeUsd < 1}>
              Pay with Stripe
            </Button>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-xl">Subscribe</h2>
          <div className="flex gap-1 rounded-[var(--radius-md)] border border-border p-1">
            {(["people", "company"] as const).map((ed) => (
              <button
                key={ed}
                type="button"
                className={cn(
                  "h-9 rounded-[var(--radius-sm)] px-3 text-xs capitalize",
                  edition === ed ? "bg-elevated text-fg" : "text-muted-foreground",
                )}
                onClick={() => {
                  setEdition(ed);
                  setPlanId(ed === "people" ? "verified" : "squad");
                }}
              >
                {ed === "people" ? "People" : "Company"}
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {plans.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPlanId(p.id)}
              className={cn(
                "rounded-[var(--radius-lg)] border p-4 text-left",
                planId === p.id ? "border-accent bg-elevated" : "border-border bg-card",
              )}
            >
              <p className="font-medium">{p.name}</p>
              <p className="mt-1 font-mono text-lg tabular-nums">
                {p.usdMonth === 0 ? "Free" : `$${p.usdMonth}/mo`}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{p.tagline}</p>
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <Label>Interval</Label>
            <div className="mt-1.5 flex gap-1">
              {(["month", "year"] as const).map((i) => (
                <button
                  key={i}
                  type="button"
                  className={cn(
                    "h-11 rounded-[var(--radius-sm)] border px-4 text-sm capitalize",
                    interval === i ? "border-accent bg-elevated" : "border-border text-muted-foreground",
                  )}
                  onClick={() => setInterval(i)}
                >
                  {i === "year" ? "Year (10× month)" : "Month"}
                </button>
              ))}
            </div>
          </div>
          {edition === "company" && (
            <div className="min-w-48 flex-1">
              <Label htmlFor="org">Company name</Label>
              <Input
                id="org"
                className="mt-1.5"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="Sovereign Cell"
              />
            </div>
          )}
          <Button onClick={() => void subscribe()} disabled={busy}>
            {dueUsd === 0 ? "Set Initiate" : `Seal ${dueTrv} TRV · $${dueUsd}`}
          </Button>
        </div>
        {(live?.credits ?? 0) < dueTrv && dueTrv > 0 ? (
          <p className="text-xs text-warn">
            This node holds {live?.credits ?? 0} TRV. Convert at least {dueTrv - (live?.credits ?? 0)} more.
          </p>
        ) : null}
      </section>

      {org && (
        <section className="rounded-[var(--radius-xl)] border border-border bg-card p-5">
          <h2 className="font-display text-xl">{org.name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {org.members.length}/{org.seats} seats · {planById(org.planId).name} · slug {org.slug}
          </p>
          <ul className="mt-3 space-y-1 text-sm">
            {org.members.map((m) => (
              <li key={m.userId} className="flex justify-between gap-2">
                <span>
                  {m.displayName} <span className="text-muted-foreground">@{m.handle}</span>
                </span>
                <span className="text-xs uppercase text-muted-foreground">{m.role}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex gap-2">
            <Input
              placeholder="Viewer handle"
              value={invite}
              onChange={(e) => setInvite(e.target.value)}
            />
            <Button variant="secondary" onClick={() => void inviteSeat()} disabled={busy || !invite}>
              Invite seat
            </Button>
          </div>
        </section>
      )}

      <section>
        <h2 className="font-display text-xl">Ledger</h2>
        {invoices.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">No invoices yet.</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="py-2 pr-3 font-medium">When</th>
                  <th className="py-2 pr-3 font-medium">Kind</th>
                  <th className="py-2 pr-3 font-medium">Memo</th>
                  <th className="py-2 pr-3 font-medium">USD</th>
                  <th className="py-2 font-medium">TRV</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-t border-border">
                    <td className="py-2 pr-3 font-mono text-xs tabular-nums">
                      {new Date(inv.createdAt).toLocaleString()}
                    </td>
                    <td className="py-2 pr-3 capitalize">{inv.kind}</td>
                    <td className="py-2 pr-3 text-muted-foreground">{inv.memo}</td>
                    <td className="py-2 pr-3 font-mono tabular-nums">${(inv.usdCents / 100).toFixed(0)}</td>
                    <td className="py-2 font-mono tabular-nums">{inv.credits}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="text-xs leading-relaxed text-muted-foreground">
        Catalog: {ALL_PLANS.map((p) => p.name).join(" · ")}. Game rank (neuron XP)
        still advances independently. A paid plan can only lower mint fees — it
        never raises them, and it never skips the robot handshake. Stripe is a
        USD rail only.
      </p>

      <Dialog open={stripeOpen} onOpenChange={setStripeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Stripe Checkout (preview)</DialogTitle>
            <DialogDescription>
              No card number is collected here. When STRIPE_SECRET_KEY is set on
              deploy, this button becomes a real Stripe Checkout redirect. Confirm
              to settle ${stripeUsd} as{" "}
              {dest === "sol" ? `${formatSol(usdToSolMicro(stripeUsd))} SOL` : `${usdToCredits(stripeUsd)} TRV`}{" "}
              on this node.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => void stripePreviewConfirm()} disabled={busy}>
            Confirm Stripe rail
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
