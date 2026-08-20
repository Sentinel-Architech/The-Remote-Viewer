import { useEffect, useState } from "react";
import { KeyRound, Lock, Unlock, Wallet } from "lucide-react";
import { toast } from "sonner";
import { useViewer } from "./viewer-context";
import { bindPhantomPubkey, bindWalletPubkey } from "@/lib/trv/server";
import {
  connectPhantom,
  createWallet,
  exportSeedIfUnlocked,
  isUnlocked,
  loadVault,
  lockWallet,
  onWalletChange,
  unlockWallet,
} from "@/lib/trv/wallet-client";
import { formatSol } from "@/lib/trv/onramp";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Sheet, SheetContent } from "./ui/sheet";
import { Badge } from "./ui/badge";

export function WalletDock() {
  const { profile, setProfile } = useViewer();
  const [open, setOpen] = useState(false);
  const [hasVault, setHasVault] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState("");
  const [pubkey, setPubkey] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void loadVault().then((v) => {
      setHasVault(Boolean(v));
      setPubkey(v?.pubkey ?? profile?.walletPubkey ?? null);
    });
    const off = onWalletChange(() => setUnlocked(isUnlocked()));
    setUnlocked(isUnlocked());
    const onOpen = () => setOpen(true);
    window.addEventListener("trv-open-wallet", onOpen);
    return () => {
      off();
      window.removeEventListener("trv-open-wallet", onOpen);
    };
  }, [profile?.walletPubkey]);

  useEffect(() => {
    if (!unlocked) return;
    const t = window.setTimeout(() => {
      lockWallet();
      toast.message("Wallet locked after idle.");
    }, 5 * 60 * 1000);
    return () => window.clearTimeout(t);
  }, [unlocked, open]);

  async function create() {
    if (pin.length < 6) {
      toast.error("PIN must be at least 6 characters.");
      return;
    }
    setBusy(true);
    try {
      const pk = await createWallet(pin);
      setHasVault(true);
      setUnlocked(true);
      setPubkey(pk);
      const p = await bindWalletPubkey({ data: pk });
      if (p) setProfile(p);
      setPin("");
      toast.success("Native wallet sealed on this device.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Create failed");
    } finally {
      setBusy(false);
    }
  }

  async function unlock() {
    setBusy(true);
    try {
      const pk = await unlockWallet(pin);
      setUnlocked(true);
      setPubkey(pk);
      setPin("");
      toast.success("Wallet unlocked for this session.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unlock failed");
    } finally {
      setBusy(false);
    }
  }

  async function phantom() {
    setBusy(true);
    try {
      const pk = await connectPhantom();
      const p = await bindPhantomPubkey({ data: pk });
      if (p) setProfile(p);
      toast.success("Phantom connected. Native wallet stays the default.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Phantom unavailable");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="fixed bottom-[calc(5.75rem+env(safe-area-inset-bottom))] left-3 z-30 hidden md:bottom-auto md:top-1/2 md:block md:-translate-y-1/2">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="grid h-11 w-11 place-items-center rounded-full border border-border bg-card text-muted-foreground hover:text-fg"
          aria-label="Viewer wallet"
        >
          {unlocked ? <Unlock className="size-4" /> : <Lock className="size-4" />}
        </button>
      </div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent>
          <h2 className="font-display text-xl">Viewer wallet</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Your keys live on this device, behind a PIN you set — the default
            unlock. Stripe can fund TRV or SOL. Phantom is an optional export,
            not the lock.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant={unlocked ? "native" : "warn"}>{unlocked ? "Unlocked" : "Locked"}</Badge>
            {profile?.phantomPubkey ? <Badge variant="muted">Phantom linked</Badge> : null}
          </div>
          <p className="mt-3 font-mono text-lg tabular-nums">{profile?.credits ?? 0} TRV</p>
          <p className="font-mono text-sm tabular-nums text-muted-foreground">
            {formatSol(profile?.solMicro ?? 0)} SOL
          </p>
          {pubkey ? (
            <p className="mt-2 break-all font-mono text-[11px] text-muted-foreground">{pubkey}</p>
          ) : null}

          {!hasVault ? (
            <div className="mt-4 space-y-2">
              <Label htmlFor="wpin">Create default unlock PIN</Label>
              <Input
                id="wpin"
                type="password"
                minLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                autoComplete="new-password"
              />
              <Button className="w-full" disabled={busy} onClick={() => void create()}>
                <KeyRound className="size-4" /> Seal native wallet
              </Button>
            </div>
          ) : unlocked ? (
            <div className="mt-4 space-y-2">
              <Button variant="secondary" className="w-full" onClick={() => lockWallet()}>
                Lock now
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  const seed = exportSeedIfUnlocked();
                  if (!seed) return;
                  void navigator.clipboard.writeText(seed);
                  toast.success("Seed copied. Store it offline.");
                }}
              >
                Copy seed (unlocked only)
              </Button>
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              <Label htmlFor="upin">Unlock PIN</Label>
              <Input
                id="upin"
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                autoComplete="current-password"
              />
              <Button className="w-full" disabled={busy} onClick={() => void unlock()}>
                Unlock
              </Button>
            </div>
          )}

          <div className="mt-5 rounded-[var(--radius-md)] border border-border bg-elevated p-3">
            <p className="flex items-center gap-2 text-sm">
              <Wallet className="size-4" /> Phantom (optional)
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Connect only if you want SOL to land on a Phantom address. Native
              TRV wallet remains the default.
            </p>
            {profile?.phantomPubkey ? (
              <p className="mt-2 break-all font-mono text-[11px]">{profile.phantomPubkey}</p>
            ) : (
              <Button className="mt-3 w-full" variant="secondary" disabled={busy} onClick={() => void phantom()}>
                Connect Phantom
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
