import { useState } from "react";
import { trackEvent, getSignupSource } from "@/lib/analytics";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

type AuthMode = "signin" | "signup";

type AuthProps = {
  onAuthed: () => void;
  onGoAdmin?: () => void;
  onGuest?: () => void;
};

const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.3 29.3 35.5 24 35.5c-6.4 0-11.5-5.1-11.5-11.5S17.6 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.6 6.4 29 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.4-.4-3.5z" />
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.6 6.4 29 4.5 24 4.5 16.3 4.5 9.7 8.9 6.3 14.7z" />
    <path fill="#4CAF50" d="M24 43.5c5 0 9.5-1.9 12.9-5l-6-5.1c-2 1.4-4.4 2.2-6.9 2.2-5.3 0-9.7-3.2-11.3-7.7l-6.5 5C9.5 39 16.2 43.5 24 43.5z" />
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.4 5.4l6 5.1C40 35.2 43.5 30 43.5 24c0-1.2-.1-2.4-.4-3.5z" />
  </svg>
);

const AppleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M16.365 1.43c0 1.14-.42 2.2-1.26 3.07-.88.93-1.96 1.47-3.05 1.39-.13-1.13.4-2.27 1.21-3.13.86-.9 2.06-1.46 3.1-1.47.02.05.02.1 0 .14zM20.5 17.27c-.57 1.31-.84 1.9-1.57 3.06-1.02 1.61-2.46 3.62-4.25 3.63-1.59.01-2-1.04-4.16-1.03-2.16.01-2.61 1.05-4.2 1.04-1.79-.01-3.16-1.82-4.18-3.43C-.5 16.95-.83 11.55 1.42 8.68c1.6-2.04 4.12-3.23 6.5-3.23 2.42 0 3.94 1.33 5.94 1.33 1.94 0 3.12-1.33 5.92-1.33 2.11 0 4.35 1.15 5.95 3.14-5.23 2.86-4.38 10.34-5.23 8.68z" />
  </svg>
);

export const Auth = ({ onAuthed, onGuest }: AuthProps) => {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setPassword("");
    setShowPassword(false);
  };

  const normalizedGmail = () => email.trim().toLowerCase();

  const hasValidGmail = (value: string) => {
    if (value.endsWith("@gmail.com")) return true;
    toast.error("Please enter a Gmail address ending with @gmail.com");
    return false;
  };

  const handleEmail = async (event: React.FormEvent) => {
    event.preventDefault();
    const normalizedEmail = normalizedGmail();
    if (!hasValidGmail(normalizedEmail)) return;

    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;

        void trackEvent("signup", { source: getSignupSource() });
        if (!data.session) {
          toast.success("Account created. Check your email to confirm it.");
          switchMode("signin");
          return;
        }
        toast.success("Your account is ready");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });
        if (error) throw error;
      }

      onAuthed();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    const normalizedEmail = normalizedGmail();
    if (!hasValidGmail(normalizedEmail)) return;

    setResetting(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success("Password reset link sent. Check your email.");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Could not send the reset link");
    } finally {
      setResetting(false);
    }
  };

  const handleOAuth = async (provider: "google" | "apple") => {
    setLoading(true);
    const startedAt = new Date().toISOString();
    const context = {
      provider,
      origin: window.location.origin,
      href: window.location.href,
      ua: navigator.userAgent,
      startedAt,
    };
    console.log("[OAuth] initiate", context);

    try {
      const result = await lovable.auth.signInWithOAuth(provider, {
        redirect_uri: window.location.origin,
      });
      console.log("[OAuth] signInWithOAuth result", {
        provider,
        redirected: (result as { redirected?: boolean })?.redirected,
        hasError: !!result?.error,
        error: result?.error,
      });

      if (result.error) {
        toast.error(`${provider}: ${result.error.message ?? "Sign-in failed"}`);
        setLoading(false);
        return;
      }
      if (result.redirected) return;
      onAuthed();
    } catch (error: unknown) {
      console.error("[OAuth] signInWithOAuth threw", { provider, error });
      toast.error(`${provider}: ${error instanceof Error ? error.message : "Sign-in failed"}`);
      setLoading(false);
    }
  };

  const isSignin = mode === "signin";

  return (
    <main className="relative flex min-h-[100dvh] items-center justify-center overflow-x-hidden bg-background px-4 py-8 sm:px-6 sm:py-12">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -start-24 -top-24 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-32 -end-20 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      </div>

      <section className="relative z-10 w-full max-w-[460px] animate-fade-up">
        <header className="mb-6 flex flex-col items-center text-center sm:mb-8">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary text-primary-foreground shadow-[0_12px_35px_hsl(var(--primary)/0.25)]">
            <Sparkles className="h-6 w-6" />
          </div>
          <p className="text-sm font-extrabold uppercase tracking-[0.28em] text-primary">Tamayzak</p>
          <p className="mt-1 text-sm text-muted-foreground">Your study space · مساحتك للدراسة</p>
        </header>

        <div className="relative overflow-hidden rounded-[30px] border border-border/80 bg-card/90 p-5 shadow-[0_24px_70px_-28px_hsl(var(--foreground)/0.28)] backdrop-blur-xl sm:p-7">
          <div className="pointer-events-none absolute end-0 top-0 h-20 w-20 bg-primary/10 [clip-path:polygon(100%_0,0_0,100%_100%)]" />

          <div className="relative grid grid-cols-2 gap-1 rounded-2xl border border-border/70 bg-muted/60 p-1" role="tablist" aria-label="Authentication mode">
            {(["signin", "signup"] as const).map((item) => {
              const active = mode === item;
              return (
                <button
                  key={item}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => switchMode(item)}
                  className={`h-11 rounded-xl text-sm font-bold transition-all ${
                    active
                      ? "bg-background text-foreground shadow-sm ring-1 ring-border/70"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item === "signin" ? "Sign in" : "Create account"}
                </button>
              );
            })}
          </div>

          <div className="relative mb-6 mt-7">
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
              {isSignin ? "Welcome back" : "Start studying smarter"}
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {isSignin
                ? "Sign in to continue where you stopped."
                : "Create your account and build your personal study plan."}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => handleOAuth("google")}
              disabled={loading}
              className="flex h-12 items-center justify-center gap-2.5 rounded-2xl border border-border bg-background font-semibold text-foreground transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md disabled:pointer-events-none disabled:opacity-60"
            >
              <GoogleIcon />
              Google
            </button>
            <button
              type="button"
              onClick={() => handleOAuth("apple")}
              disabled={loading}
              className="flex h-12 items-center justify-center gap-2.5 rounded-2xl bg-foreground font-semibold text-background transition hover:-translate-y-0.5 hover:opacity-90 hover:shadow-md disabled:pointer-events-none disabled:opacity-60"
            >
              <AppleIcon />
              Apple
            </button>
          </div>

          <div className="my-6 flex items-center gap-3" aria-hidden="true">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">or use Gmail</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleEmail} className="space-y-4" noValidate>
            <div>
              <label htmlFor="auth-email" className="mb-2 block text-sm font-bold text-foreground">
                Gmail address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="auth-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@gmail.com"
                  className="h-12 w-full rounded-2xl border border-border bg-background/80 ps-11 pe-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/65 focus:border-primary focus:ring-4 focus:ring-primary/10"
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label htmlFor="auth-password" className="text-sm font-bold text-foreground">
                  Password
                </label>
                {isSignin && (
                  <button
                    type="button"
                    onClick={handlePasswordReset}
                    disabled={resetting}
                    className="text-xs font-semibold text-primary hover:underline disabled:opacity-60"
                  >
                    {resetting ? "Sending…" : "Forgot password?"}
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="auth-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={isSignin ? "current-password" : "new-password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 6 characters"
                  className="h-12 w-full rounded-2xl border border-border bg-background/80 ps-11 pe-12 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/65 focus:border-primary focus:ring-4 focus:ring-primary/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((shown) => !shown)}
                  className="absolute end-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {!isSignin && (
              <div className="flex items-start gap-2 rounded-2xl bg-primary/10 px-3 py-2.5 text-xs leading-5 text-muted-foreground">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                Your account keeps your points, streak and study progress synced.
              </div>
            )}

            <button
              type="submit"
              disabled={loading || password.length < 6 || !email.trim()}
              className="group flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-sm font-extrabold text-primary-foreground shadow-[0_12px_30px_hsl(var(--primary)/0.22)] transition hover:-translate-y-0.5 hover:bg-primary/90 disabled:pointer-events-none disabled:translate-y-0 disabled:opacity-50 disabled:shadow-none"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  {isSignin ? "Sign in" : "Create my account"}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span>Your account details are securely protected.</span>
          </div>
        </div>

        {onGuest && (
          <button
            type="button"
            onClick={onGuest}
            className="mt-4 flex min-h-12 w-full items-center justify-center rounded-2xl border border-border/80 bg-card/65 px-4 text-sm font-bold text-foreground backdrop-blur transition hover:border-primary/40 hover:bg-card"
          >
            متابعة كضيف · Continue as guest
          </button>
        )}
      </section>
    </main>
  );
};

export default Auth;
