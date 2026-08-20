import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { ensureProfile, markNativeSecurity, attestBaseline } from "@/lib/trv/server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FluidRipple } from "@/components/fluid-ripple";
import { AlertTriangle, Shield } from "lucide-react";
import { NETWORK_NAME, NETWORK_TAG } from "@/lib/trv/network";
import { PAID_TRIAL_HOURS } from "@/lib/trv/trial";
import { pageHead } from "@/lib/trv/seo";

type LoginSearch = { tab?: string; trial?: string };

export const Route = createFileRoute("/login")({
  validateSearch: (s: Record<string, unknown>): LoginSearch => ({
    tab: s.tab === "signin" ? "signin" : undefined,
    trial: s.trial === "verified" || s.trial === "1" ? "verified" : undefined,
  }),
  head: () =>
    pageHead({
      title: "Native lock",
      description: `Register a native TRV lock. Outside Viewers can start ${PAID_TRIAL_HOURS} hours of Verified with no card.`,
      path: "/login",
      index: false,
    }),
  component: Login,
});

function Login() {
  const { user, isPending } = useCurrentUserState();
  const userId = user?.id;
  const displayName = user?.displayName ?? undefined;
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [tab, setTab] = useState(search.tab === "signin" ? "signin" : "register");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [age18, setAge18] = useState(false);
  const [ofac, setOfac] = useState(false);

  useEffect(() => {
    if (search.trial === "verified") {
      try {
        localStorage.setItem("trv-paid-trial", "verified");
      } catch {
        /* ignore */
      }
    }
    if (search.tab === "signin") setTab("signin");
  }, [search.trial, search.tab]);

  useEffect(() => {
    if (isPending || !userId) return;
    const paidTrial =
      typeof window !== "undefined" ? localStorage.getItem("trv-paid-trial") === "verified" : false;
    void ensureProfile({ data: { displayName, paidTrial } })
      .then(() => navigate({ to: "/hub" }))
      .catch(() => navigate({ to: "/hub" }));
  }, [isPending, userId, displayName, navigate]);

  async function bindHub(opts: { displayName?: string; native?: boolean }) {
    await authClient.getSession();
    const referral = typeof window !== "undefined" ? localStorage.getItem("trv-ref") || undefined : undefined;
    const edition = typeof window !== "undefined" ? localStorage.getItem("trv-edition") || undefined : undefined;
    const paidTrial = typeof window !== "undefined" ? localStorage.getItem("trv-paid-trial") === "verified" : false;
    try {
      await ensureProfile({
        data: { displayName: opts.displayName, native: opts.native, referral, edition, paidTrial },
      });
      if (opts.native) await markNativeSecurity();
    } catch {
      // Hub ViewerProvider creates the node once the session is live.
    }
  }

  async function register(e: FormEvent) {
    e.preventDefault();
    if (!authEnabled) return;
    if (!age18 || !ofac) {
      toast.error("18+ and OFAC attestations are required.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const { error: err } = await authClient.signUp.email({
        email,
        password,
        name: name || "Remote Viewer",
      });
      if (err) throw new Error(err.message || "Register failed");
      await bindHub({ displayName: name || "Remote Viewer", native: true });
      try {
        await attestBaseline({ data: { age18: true, ofac: true } });
      } catch {
        /* Age gate in hub will catch it. */
      }
      toast.success("Native TRV lock set. Welcome, Viewer.");
      navigate({ to: "/hub" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Register failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  async function nativeSignIn(e: FormEvent) {
    e.preventDefault();
    if (!authEnabled) return;
    setBusy(true);
    setError(null);
    try {
      const { error: err } = await authClient.signIn.email({ email, password });
      if (err) throw new Error(err.message || "Sign-in failed");
      await bindHub({ native: true });
      toast.success("Native lock restored.");
      navigate({ to: "/hub" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Sign-in failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  async function oauth(providerId: string) {
    if (!authEnabled || busy) return;
    setBusy(true);
    setError(null);
    try {
      await signIn(providerId, { callbackURL: "/hub", errorCallbackURL: "/login" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Connection failed";
      const extra = /pop-up|popup|cancelled/i.test(msg)
        ? " Native email + password is the primary TRV lock and works without a pop-up."
        : " If Google/X is blocked, register with a native email lock.";
      setError(msg + extra);
      toast.error(msg);
      setBusy(false);
    }
  }

  return (
    <main className="relative min-h-dvh bg-bg text-fg">
      <div className="absolute inset-0 opacity-50">
        <FluidRipple viscosity={0.3} waveStrength={0.4} colorMap="neural" vortex={2.2} />
      </div>
      <div className="relative z-10 mx-auto grid min-h-dvh max-w-5xl gap-6 px-4 py-8 md:grid-cols-2 md:items-center md:gap-8 md:px-5 md:py-10">
        <div>
          <Link to="/" className="text-xs tracking-[0.22em] uppercase text-muted-foreground">
            {NETWORK_NAME}
          </Link>
          <h1 className="mt-4 font-display text-4xl leading-tight md:text-5xl">
            Lock a native node
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
            {NETWORK_TAG} Native TRV security is email plus a password stored in this hub — not
            a Google or X session. Corporate identity is a bridge for migration
            in. Sentinel does not go out. M-o-E, Shield, and native mints assume you hold the lock.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <Shield className="mt-0.5 size-4 shrink-0 text-accent" />
              Credentials live in TRV. No corporate backdoor is required.
            </li>
            <li className="flex gap-2">
              <Shield className="mt-0.5 size-4 shrink-0 text-accent" />
              After register, paste any export from another platform.
            </li>
            <li className="flex gap-2">
              <Shield className="mt-0.5 size-4 shrink-0 text-accent" />
              Robot handshake later unlocks Gateway methods — documents stay free.
            </li>
          </ul>
        </div>

        <div className="rounded-[var(--radius-xl)] border border-border bg-card/90 p-6 backdrop-blur-sm">
          {!authEnabled ? (
            <p className="text-sm text-muted-foreground">Sign-in is disabled.</p>
          ) : (
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="w-full">
                <TabsTrigger value="register" className="flex-1">
                  Register
                </TabsTrigger>
                <TabsTrigger value="signin" className="flex-1">
                  Sign in
                </TabsTrigger>
              </TabsList>
              <TabsContent value="register">
                {search.trial === "verified" ? (
                  <p className="mb-3 rounded-[var(--radius-md)] border border-accent/40 bg-elevated p-3 text-sm">
                    Outside trial · {PAID_TRIAL_HOURS} hours of Verified after this lock. No card. Handshake still required.
                  </p>
                ) : null}
                <form className="space-y-3" onSubmit={register}>
                  <div>
                    <Label htmlFor="name">Viewer name</Label>
                    <Input
                      id="name"
                      className="mt-1.5"
                      autoComplete="nickname"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      className="mt-1.5"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="pw">Password</Label>
                    <Input
                      id="pw"
                      type="password"
                      minLength={8}
                      className="mt-1.5"
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <p className="mt-1 text-[11px] text-muted-foreground">At least 8 characters.</p>
                  </div>
                  <label className="flex items-start gap-2 text-xs text-muted-foreground">
                    <input type="checkbox" className="mt-0.5" checked={age18} onChange={(e) => setAge18(e.target.checked)} />
                    I am 18 or older. TRV is not for children.
                  </label>
                  <label className="flex items-start gap-2 text-xs text-muted-foreground">
                    <input type="checkbox" className="mt-0.5" checked={ofac} onChange={(e) => setOfac(e.target.checked)} />
                    I am not a sanctioned person and I am not opening this node for a foreign-adversary controlled application.
                  </label>
                  <Button type="submit" className="w-full" disabled={busy || !age18 || !ofac}>
                    {busy ? "Sealing lock…" : search.trial === "verified" ? "Create lock · start 2-day trial" : "Create native TRV lock"}
                  </Button>
                </form>
              </TabsContent>
              <TabsContent value="signin">
                <form className="space-y-3" onSubmit={nativeSignIn}>
                  <div>
                    <Label htmlFor="email2">Email</Label>
                    <Input
                      id="email2"
                      type="email"
                      className="mt-1.5"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="pw2">Password</Label>
                    <Input
                      id="pw2"
                      type="password"
                      minLength={8}
                      className="mt-1.5"
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={busy}>
                    {busy ? "Restoring lock…" : "Sign in natively"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          )}

          {error ? (
            <p
              role="alert"
              className="mt-4 rounded-[var(--radius-md)] border border-warn/40 bg-warn/10 px-3 py-2 text-xs leading-relaxed text-warn"
            >
              {error}
            </p>
          ) : null}

          <div className="mt-6 rounded-[var(--radius-md)] border border-warn/30 bg-warn/10 p-3">
            <p className="flex items-start gap-2 text-xs leading-relaxed text-warn">
              <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
              External identity bridges are not native TRV security. They open a
              sign-in window. If that window is blocked, use the native lock above.
            </p>
            <div className="mt-3 space-y-2">
              {GROK_PROVIDERS.map((p) => (
                <Button
                  key={p.providerId}
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled={busy}
                  onClick={() => void oauth(p.providerId)}
                >
                  Continue with {p.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
