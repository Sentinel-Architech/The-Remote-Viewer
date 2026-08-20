import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { toast } from "sonner";
import {
  Camera,
  FileText,
  Landmark,
  Link2,
  Radio,
  Trash2,
  Upload,
  Wallet,
} from "lucide-react";
import { useViewer } from "@/components/viewer-context";
import {
  deleteViewerDoc,
  getProfileLedger,
  importMigration,
  listMigrations,
  listMyDocs,
  listMyReferrals,
  putViewerDoc,
  updateMyProfile,
  updatePortrait,
} from "@/lib/trv/server";
import { REFERRAL_BONUS_CREDITS, REFERRAL_NEW_CREDITS, REFERRAL_TRIAL_DAYS } from "@/lib/trv/ads";
import { ShareBeam } from "@/components/share-beam";
import { parseTheme } from "@/lib/trv/themes";
import { compressImage, readFileAsDataUrl, snapshotVideo } from "@/lib/trv/image";
import { DOC_KIND_LABEL, DOC_KINDS, type DocKind } from "@/lib/trv/profile";
import { formatSol } from "@/lib/trv/onramp";
import { planById } from "@/lib/trv/saas";
import { STAGE_LABEL, TIER_LABEL } from "@/lib/trv/tiers";
import { LiveBadge, ViewerMark } from "@/components/viewer-mark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { InvoiceRow, MigrationRow, ProfileLink, SaleRow, ShopPurchase, ViewerDoc } from "@/lib/trv/types";

export const Route = createFileRoute("/hub/profile")({ component: ProfilePage });

function detectPlatform(text: string): string {
  if (/t\.co|twitter\.com|x\.com/i.test(text)) return "x";
  if (/instagram/i.test(text)) return "instagram";
  if (/reddit\.com|\/r\//i.test(text)) return "reddit";
  if (/tiktok/i.test(text)) return "tiktok";
  if (/facebook|fb\.com/i.test(text)) return "facebook";
  return "paste";
}

function ProfilePage() {
  const { profile, setProfile } = useViewer();
  const [displayName, setDisplayName] = useState("");
  const [handle, setHandle] = useState("");
  const [bio, setBio] = useState("");
  const [manifesto, setManifesto] = useState("");
  const [locationLabel, setLocationLabel] = useState("");
  const [craft, setCraft] = useState("");
  const [website, setWebsite] = useState("");
  const [statusLine, setStatusLine] = useState("");
  const [links, setLinks] = useState<ProfileLink[]>([]);
  const [isPublic, setIsPublic] = useState(true);
  const [paste, setPaste] = useState("");
  const [imports, setImports] = useState<MigrationRow[]>([]);
  const [refs, setRefs] = useState<{ handle: string; displayName: string; bonusCredits: number }[]>([]);
  const [docs, setDocs] = useState<ViewerDoc[]>([]);
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [sales, setSales] = useState<SaleRow[]>([]);
  const [shop, setShop] = useState<ShopPurchase[]>([]);
  const [totals, setTotals] = useState({ gross: 0, fees: 0, net: 0, count: 0 });
  const [busy, setBusy] = useState(false);
  const [camOpen, setCamOpen] = useState(false);
  const [docTitle, setDocTitle] = useState("");
  const [docKind, setDocKind] = useState<DocKind>("note");
  const [docBody, setDocBody] = useState("");
  const [openDoc, setOpenDoc] = useState<ViewerDoc | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);
  const docFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!profile) return;
    setDisplayName(profile.displayName);
    setHandle(profile.handle);
    setBio(profile.bio);
    setManifesto(profile.manifesto);
    setLocationLabel(profile.locationLabel);
    setCraft(profile.craft);
    setWebsite(profile.website);
    setStatusLine(profile.statusLine);
    setLinks(profile.links);
    setIsPublic(profile.isPublic);
    void listMigrations().then(setImports).catch(() => {});
    void listMyReferrals().then(setRefs).catch(() => {});
    void listMyDocs().then(setDocs).catch(() => {});
    void getProfileLedger()
      .then((l) => {
        setInvoices(l.invoices);
        setSales(l.sales);
        setShop(l.shop);
        setTotals(l.totals);
      })
      .catch(() => {});
  }, [profile]);

  useEffect(() => {
    if (!camOpen) {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      return;
    }
    void navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "user" }, audio: false })
      .then((stream) => {
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(() => {
        toast.error("Camera blocked");
        setCamOpen(false);
      });
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, [camOpen]);

  if (!profile) return <div className="p-8 text-sm text-muted-foreground">Binding node…</div>;

  const share = typeof window !== "undefined" ? `${window.location.origin}/v/${profile.handle}` : `/v/${profile.handle}`;
  const referral =
    typeof window !== "undefined" ? `${window.location.origin}/r/${profile.handle}` : `/r/${profile.handle}`;
  const plan = planById(profile.planId);

  async function savePortrait(kind: "avatar" | "cover", file: File) {
    setBusy(true);
    try {
      const data =
        kind === "avatar"
          ? await compressImage(file, 384, 384, 0.84)
          : await compressImage(file, 1280, 420, 0.78);
      const p = await updatePortrait({
        data: kind === "avatar" ? { avatarData: data } : { coverData: data },
      });
      if (p) setProfile(p);
      toast.success(kind === "avatar" ? "Portrait saved" : "Cover saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Image failed");
    } finally {
      setBusy(false);
    }
  }

  async function captureStill() {
    const video = videoRef.current;
    if (!video || video.readyState < 2) {
      toast.error("Camera not ready");
      return;
    }
    setBusy(true);
    try {
      const data = snapshotVideo(video, 384, 384, 0.84);
      const p = await updatePortrait({ data: { avatarData: data } });
      if (p) setProfile(p);
      setCamOpen(false);
      toast.success("Portrait captured");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Capture failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6 p-5 md:p-8">
      <div>
        <p className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground">Dedicated node</p>
        <h1 className="mt-1 font-display text-3xl">Remote Viewer profile</h1>
        <p className="mt-1 max-w-xl text-sm text-muted-foreground">
          Portraits, public card, finances, and a private docs vault — this page is
          only your node. Government IDs stay on-device in Citizen lock, never here.
        </p>
      </div>

      <section className="overflow-hidden rounded-[var(--radius-xl)] border border-border bg-card">
        <div className="relative h-36 bg-elevated md:h-44">
          {profile.coverData ? (
            <img src={profile.coverData} alt="" className="size-full object-cover" />
          ) : (
            <div className="size-full bg-[radial-gradient(ellipse_at_top,color-mix(in_oklab,var(--accent)_18%,transparent),transparent_70%)]" />
          )}
          <button
            type="button"
            className="absolute right-3 top-3 grid h-11 w-11 place-items-center rounded-full border border-border bg-card/90 text-fg"
            aria-label="Change cover"
            onClick={() => coverRef.current?.click()}
          >
            <Upload className="size-4" />
          </button>
          <input
            ref={coverRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (file) void savePortrait("cover", file);
            }}
          />
        </div>
        <div className="flex flex-col gap-4 px-5 pb-5 md:flex-row md:items-end md:justify-between">
          <div className="-mt-10 flex items-end gap-4">
            <ViewerMark
              name={profile.displayName || profile.handle}
              src={profile.avatarData}
              live={profile.liveNow}
              size="xl"
            />
            <div className="pb-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-2xl">{profile.displayName || profile.handle}</h2>
                {profile.liveNow ? <LiveBadge title={profile.liveTitle} /> : null}
              </div>
              <p className="font-mono text-sm text-muted-foreground">@{profile.handle}</p>
              {profile.statusLine ? <p className="mt-1 text-sm">{profile.statusLine}</p> : null}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => fileRef.current?.click()} disabled={busy}>
              <Upload className="size-4" />
              Photo
            </Button>
            <Button type="button" variant="secondary" size="sm" onClick={() => setCamOpen(true)} disabled={busy}>
              <Camera className="size-4" />
              Camera
            </Button>
            {profile.liveNow ? (
              <Button asChild size="sm">
                <Link to="/hub/live">
                  <Radio className="size-4" />
                  End live
                </Link>
              </Button>
            ) : (
              <Button asChild size="sm" variant="secondary">
                <Link to="/hub/live">Go live</Link>
              </Button>
            )}
            <Button asChild size="sm" variant="secondary">
              <Link to="/v/$handle" params={{ handle: profile.handle }}>
                Public card
              </Link>
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 border-t border-border px-5 py-3">
          <Badge variant={profile.nativeSecurity ? "native" : "warn"}>
            {profile.nativeSecurity ? "Native TRV" : "Bridged"}
          </Badge>
          <Badge>{TIER_LABEL[profile.tier as keyof typeof TIER_LABEL] ?? profile.tier}</Badge>
          <Badge variant="muted">{STAGE_LABEL[profile.neuronStage] ?? "Neuron"}</Badge>
          <Badge variant={profile.citizenAt ? "native" : "muted"}>
            {profile.citizenAt ? "Citizen lock" : "Citizen open"}
          </Badge>
          <Badge variant="muted">{isPublic ? "Public card" : "Private node"}</Badge>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) void savePortrait("avatar", file);
          }}
        />
      </section>

      <Tabs defaultValue="identity">
        <TabsList className="flex h-auto w-full flex-wrap justify-start">
          <TabsTrigger value="identity">Identity</TabsTrigger>
          <TabsTrigger value="finances">Finances</TabsTrigger>
          <TabsTrigger value="docs">Docs</TabsTrigger>
          <TabsTrigger value="share">Share</TabsTrigger>
        </TabsList>

        <TabsContent value="identity">
          <form
            className="grid gap-6 md:grid-cols-2"
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              try {
                const p = await updateMyProfile({
                  data: {
                    displayName,
                    handle,
                    bio,
                    manifesto,
                    locationLabel,
                    craft,
                    website,
                    statusLine,
                    links,
                    isPublic,
                  },
                });
                if (p) setProfile(p);
                toast.success("Profile saved");
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Save failed");
              } finally {
                setBusy(false);
              }
            }}
          >
            <div className="space-y-3">
              <div>
                <Label htmlFor="dn">Name</Label>
                <Input id="dn" className="mt-1.5" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="hd">Handle</Label>
                <Input id="hd" className="mt-1.5" value={handle} onChange={(e) => setHandle(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="st">Status</Label>
                <Input
                  id="st"
                  className="mt-1.5"
                  value={statusLine}
                  onChange={(e) => setStatusLine(e.target.value)}
                  placeholder="What this node is doing"
                />
              </div>
              <div>
                <Label htmlFor="loc">Location label</Label>
                <Input
                  id="loc"
                  className="mt-1.5"
                  value={locationLabel}
                  onChange={(e) => setLocationLabel(e.target.value)}
                  placeholder="City, state — never exact coords"
                />
              </div>
              <div>
                <Label htmlFor="cr">Craft</Label>
                <Input
                  id="cr"
                  className="mt-1.5"
                  value={craft}
                  onChange={(e) => setCraft(e.target.value)}
                  placeholder="Farmer, smith, writer…"
                />
              </div>
              <div>
                <Label htmlFor="web">Website</Label>
                <Input
                  id="web"
                  className="mt-1.5"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://"
                />
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea id="bio" className="mt-1.5" rows={4} value={bio} onChange={(e) => setBio(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="man">Manifesto</Label>
                <Textarea id="man" className="mt-1.5" rows={4} value={manifesto} onChange={(e) => setManifesto(e.target.value)} />
              </div>
              <div className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] border border-border bg-elevated px-3 py-3">
                <div>
                  <p className="text-sm">Public card</p>
                  <p className="text-xs text-muted-foreground">Anyone with the QR can open /v/{handle || "handle"}</p>
                </div>
                <Switch checked={isPublic} onCheckedChange={setIsPublic} />
              </div>
              <div>
                <Label>Links</Label>
                <ul className="mt-2 space-y-2">
                  {links.map((link, i) => (
                    <li key={`${link.label}-${i}`} className="flex gap-2">
                      <Input
                        aria-label="Link label"
                        className="w-28"
                        value={link.label}
                        onChange={(e) => {
                          const next = [...links];
                          next[i] = { ...link, label: e.target.value };
                          setLinks(next);
                        }}
                      />
                      <Input
                        aria-label="Link URL"
                        value={link.url}
                        onChange={(e) => {
                          const next = [...links];
                          next[i] = { ...link, url: e.target.value };
                          setLinks(next);
                        }}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label="Remove link"
                        onClick={() => setLinks(links.filter((_, j) => j !== i))}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
                {links.length < 6 ? (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="mt-2"
                    onClick={() => setLinks([...links, { label: "", url: "" }])}
                  >
                    <Link2 className="size-4" />
                    Add link
                  </Button>
                ) : null}
              </div>
              <Button type="submit" disabled={busy}>
                Save identity
              </Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="finances">
          <div className="grid gap-3 sm:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>TRV credits</CardTitle>
                <CardDescription>Native shop + mint rail</CardDescription>
              </CardHeader>
              <CardContent className="font-mono text-2xl tabular-nums">{profile.credits}</CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>SOL on node</CardTitle>
                <CardDescription>Phantom / native ledger</CardDescription>
              </CardHeader>
              <CardContent className="font-mono text-2xl tabular-nums">{formatSol(profile.solMicro)}</CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Creator net</CardTitle>
                <CardDescription>{totals.count} sales</CardDescription>
              </CardHeader>
              <CardContent className="font-mono text-2xl tabular-nums">{totals.net}</CardContent>
            </Card>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="size-4" />
                  Wallets
                </CardTitle>
                <CardDescription>Unlock lives on this device. Keys never leave the node.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <p>
                  Native
                  <span className="mt-1 block break-all font-mono text-muted-foreground">
                    {profile.walletPubkey ?? "Not created — open Wallet in the dock"}
                  </span>
                </p>
                <p>
                  Phantom
                  <span className="mt-1 block break-all font-mono text-muted-foreground">
                    {profile.phantomPubkey ?? "Not linked"}
                  </span>
                </p>
                <p className="text-muted-foreground">
                  Plan {plan.name}
                  {profile.trialUntil ? ` · trial until ${new Date(profile.trialUntil).toLocaleDateString()}` : ""}
                  {profile.planRenewsAt ? ` · renews ${new Date(profile.planRenewsAt).toLocaleDateString()}` : ""}
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button asChild size="sm" variant="secondary">
                    <Link to="/hub/billing">
                      <Landmark className="size-4" />
                      Convert / subscribe
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="secondary">
                    <Link to="/hub/market">Ledger</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Shop cosmetics</CardTitle>
                <CardDescription>Bought with TRV only</CardDescription>
              </CardHeader>
              <CardContent>
                {shop.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nothing equipped yet. Visit Rewards.</p>
                ) : (
                  <ul className="space-y-2 text-sm">
                    {shop.map((s) => (
                      <li key={`${s.itemId}-${s.createdAt}`} className="flex justify-between gap-2">
                        <span>{s.name}</span>
                        <span className="font-mono text-xs text-muted-foreground">{s.creditsPaid} TRV</span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Invoices</CardTitle>
              </CardHeader>
              <CardContent>
                {invoices.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No conversions or subscriptions yet.</p>
                ) : (
                  <ul className="space-y-2 text-sm">
                    {invoices.map((inv) => (
                      <li key={inv.id} className="flex justify-between gap-2">
                        <span>
                          {inv.kind} · {inv.memo || inv.planId}
                        </span>
                        <span className="font-mono text-xs text-muted-foreground">
                          {inv.credits} TRV · ${(inv.usdCents / 100).toFixed(0)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>NFT sales</CardTitle>
              </CardHeader>
              <CardContent>
                {sales.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Mint in Studio to start the ledger.</p>
                ) : (
                  <ul className="space-y-2 text-sm">
                    {sales.map((s) => (
                      <li key={s.id} className="flex justify-between gap-2">
                        <span>{s.title}</span>
                        <span className="font-mono text-xs text-muted-foreground">
                          {s.amount - s.fee} net
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="docs">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="size-4" />
                Private vault
              </CardTitle>
              <CardDescription>
                Notes, receipts, contracts, images — scoped to this Viewer. Do not
                upload state or federal IDs; Citizen lock hashes those on-device.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form
                className="space-y-3"
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!docTitle.trim() || !docBody.trim()) {
                    toast.error("Title and body required");
                    return;
                  }
                  setBusy(true);
                  try {
                    const rows = await putViewerDoc({
                      data: { title: docTitle, kind: docKind, body: docBody, mime: docKind === "image" ? "image/jpeg" : "text/plain" },
                    });
                    setDocs(rows);
                    setDocTitle("");
                    setDocBody("");
                    toast.success("Filed in vault");
                  } catch (err) {
                    toast.error(err instanceof Error ? err.message : "File failed");
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                <div className="grid gap-3 sm:grid-cols-[1fr_8rem]">
                  <div>
                    <Label htmlFor="dt">Title</Label>
                    <Input id="dt" className="mt-1.5" value={docTitle} onChange={(e) => setDocTitle(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="dk">Kind</Label>
                    <select
                      id="dk"
                      className="mt-1.5 h-11 w-full rounded-[var(--radius-sm)] border border-input bg-elevated px-3 text-sm"
                      value={docKind}
                      onChange={(e) => setDocKind(e.target.value as DocKind)}
                    >
                      {DOC_KINDS.map((k) => (
                        <option key={k} value={k}>
                          {DOC_KIND_LABEL[k]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <Textarea
                  id="doc-body"
                  rows={4}
                  value={docBody}
                  onChange={(e) => setDocBody(e.target.value)}
                  placeholder="Private note — stays on this node"
                />
                <div className="flex flex-wrap gap-2">
                  <Button type="submit" disabled={busy}>
                    File note
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => docFileRef.current?.click()} disabled={busy}>
                    <Upload className="size-4" />
                    Attach image
                  </Button>
                </div>
                <input
                  ref={docFileRef}
                  type="file"
                  accept="image/*,application/pdf,.txt"
                  className="sr-only"
                  onChange={async (e: ChangeEvent<HTMLInputElement>) => {
                    const file = e.target.files?.[0];
                    e.target.value = "";
                    if (!file) return;
                    setBusy(true);
                    try {
                      const isImage = file.type.startsWith("image/");
                      const body = isImage ? await compressImage(file, 1280, 1280, 0.78) : await readFileAsDataUrl(file);
                      if (body.length > 400_000) throw new Error("File too large for the vault");
                      const rows = await putViewerDoc({
                        data: {
                          title: docTitle.trim() || file.name.slice(0, 80),
                          kind: isImage ? "image" : "other",
                          mime: file.type || "application/octet-stream",
                          body,
                        },
                      });
                      setDocs(rows);
                      setDocTitle("");
                      toast.success("Attached");
                    } catch (err) {
                      toast.error(err instanceof Error ? err.message : "Attach failed");
                    } finally {
                      setBusy(false);
                    }
                  }}
                />
              </form>
              <ul className="space-y-2">
                {docs.length === 0 ? (
                  <li className="text-sm text-muted-foreground">Vault is empty.</li>
                ) : (
                  docs.map((d) => (
                    <li key={d.id} className="flex items-center justify-between gap-2 rounded-[var(--radius-sm)] border border-border bg-elevated px-3 py-2">
                      <button type="button" className="min-w-0 flex-1 text-left" onClick={() => setOpenDoc(d)}>
                        <span className="block truncate text-sm">{d.title}</span>
                        <span className="text-[11px] text-muted-foreground">
                          {DOC_KIND_LABEL[d.kind as DocKind] ?? d.kind} · {Math.round(d.bytes / 1024)} KB
                        </span>
                      </button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Delete ${d.title}`}
                        onClick={async () => {
                          try {
                            setDocs(await deleteViewerDoc({ data: d.id }));
                            toast.success("Removed");
                          } catch (err) {
                            toast.error(err instanceof Error ? err.message : "Delete failed");
                          }
                        }}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </li>
                  ))
                )}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="share">
          <div className="grid gap-6 md:grid-cols-[16rem_1fr]">
            <div className="rounded-[var(--radius-xl)] border border-border bg-card p-4">
              <ShareBeam value={share} label="profile" theme={parseTheme(profile.uiTheme)} />
              <p className="mt-4 text-xs text-muted-foreground">
                Referral trial · friends get {REFERRAL_TRIAL_DAYS} days ad-free + {REFERRAL_NEW_CREDITS} TRV.
                You receive {REFERRAL_BONUS_CREDITS} TRV.
              </p>
              <p className="mt-1 break-all font-mono text-[11px] text-muted-foreground">{referral}</p>
              <Button
                className="mt-2 w-full"
                variant="secondary"
                onClick={() => {
                  void navigator.clipboard.writeText(referral);
                  toast.success("Referral link copied");
                }}
              >
                Copy referral
              </Button>
              {refs.length > 0 ? (
                <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                  {refs.map((r) => (
                    <li key={r.handle}>
                      @{r.handle} · +{r.bonusCredits} TRV
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
            <section className="rounded-[var(--radius-xl)] border border-border bg-card p-5">
              <h2 className="font-display text-xl">Migrate by paste</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Copy anything from X, Instagram, Reddit, a notes app, an export file.
                TRV stores it as your archive — no OAuth into those platforms.
              </p>
              <Textarea className="mt-3" rows={6} value={paste} onChange={(e) => setPaste(e.target.value)} placeholder="Paste posts, bios, threads…" />
              <Button
                className="mt-3"
                onClick={async () => {
                  try {
                    const rows = await importMigration({ data: { source: detectPlatform(paste), content: paste } });
                    setImports(rows);
                    setPaste("");
                    toast.success("Archive ingested");
                  } catch (err) {
                    toast.error(err instanceof Error ? err.message : "Import failed");
                  }
                }}
              >
                Ingest paste
              </Button>
              <ul className="mt-4 space-y-2">
                {imports.map((m) => (
                  <li key={m.id} className="rounded-[var(--radius-sm)] border border-border p-3 text-xs text-muted-foreground">
                    <span className="font-medium text-fg">{m.sourcePlatform}</span>
                    <p className="mt-1 line-clamp-3 whitespace-pre-wrap">{m.content}</p>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={camOpen} onOpenChange={setCamOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Capture portrait</DialogTitle>
            <DialogDescription>Still stays on this node. Compressed before save.</DialogDescription>
          </DialogHeader>
          <video ref={videoRef} autoPlay muted playsInline className="mt-3 aspect-square w-full rounded-[var(--radius-md)] bg-bg object-cover" />
          <Button className="mt-3 w-full" onClick={() => void captureStill()} disabled={busy}>
            Take picture
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(openDoc)} onOpenChange={(v) => !v && setOpenDoc(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{openDoc?.title}</DialogTitle>
            <DialogDescription>
              {openDoc ? `${DOC_KIND_LABEL[(openDoc.kind as DocKind)] ?? openDoc.kind} · ${Math.round(openDoc.bytes / 1024)} KB` : ""}
            </DialogDescription>
          </DialogHeader>
          {openDoc?.body.startsWith("data:image/") ? (
            <img src={openDoc.body} alt="" className="mt-3 max-h-80 w-full rounded-[var(--radius-md)] object-contain" />
          ) : openDoc?.body.startsWith("data:") ? (
            <a className="mt-3 inline-flex h-11 items-center text-sm underline" href={openDoc.body} download={openDoc.title}>
              Download file
            </a>
          ) : (
            <p className="mt-3 whitespace-pre-wrap text-sm">{openDoc?.body}</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
