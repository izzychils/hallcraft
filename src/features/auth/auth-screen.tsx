"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Eye, EyeOff, Sparkles } from "lucide-react";
import { Logo } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { FloorPlanPreview } from "@/features/floorplan/render";
import { TEMPLATE_BY_ID } from "@/features/floorplan/templates";
import { DEMO_CREDENTIALS, signIn, signInDemo, signUp, useAuth } from "./auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function AuthScreen({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const { user, ready } = useAuth();
  const [next, setNext] = useState("/dashboard");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [studio, setStudio] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const scene = useMemo(() => {
    const template = TEMPLATE_BY_ID.gala;
    return template.build();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requested = params.get("next");
    if (requested?.startsWith("/")) setNext(requested);
  }, []);

  useEffect(() => {
    if (ready && user) router.replace(next);
  }, [next, ready, router, user]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (mode === "login") {
      const result = signIn(email, password);
      if (result.error) {
        setError(result.error);
        return;
      }
      toast.success("Welcome back", "Your studio is exactly where you left it.");
      router.push(next);
      return;
    }

    const result = signUp({ name, email, password, studio });
    if (result.error) {
      setError(result.error);
      return;
    }
    toast.success("Studio created", "A blank workspace is waiting for your first room.");
    router.push("/dashboard");
  };

  const fillDemo = () => {
    setBusy(true);
    const result = signInDemo();
    if (result.error) {
      setError(result.error);
      setBusy(false);
      return;
    }
    toast.success("Signed in to the demo studio", "You are exploring Northlight Events.");
    router.push(next);
  };

  return (
    <main className="min-h-dvh bg-[#f5f2ec] lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      <div className="relative flex min-h-dvh flex-col px-6 py-6 sm:px-10 lg:px-16">
        <div className="flex items-center justify-between">
          <Logo />
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[12px] text-[#6f695e] transition-colors hover:text-[#171510]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to site
          </Link>
        </div>

        <div className="flex flex-1 items-center py-10">
          <div className="w-full max-w-[400px] animate-slide-up">
            <p className="eyebrow">{mode === "login" ? "Studio access" : "Start your studio"}</p>
            <h1 className="mt-3 text-[clamp(2.4rem,5vw,3.6rem)] font-medium leading-[0.94] tracking-[-0.055em]">
              {mode === "login" ? (
                <>
                  Back to the
                  <br />
                  drawing board.
                </>
              ) : (
                <>
                  Make room for
                  <br />
                  better events.
                </>
              )}
            </h1>
            <p className="mt-4 max-w-sm text-[13.5px] leading-6 text-[#6f695e]">
              {mode === "login"
                ? "Sign in to open your designs, venue checks and the shared item library."
                : "Create a local studio workspace. Your designs stay in this browser until you connect a backend."}
            </p>

            <form onSubmit={submit} className="mt-8 space-y-4">
              {mode === "signup" ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="auth-name">Your name</Label>
                    <Input
                      id="auth-name"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="Maya Adeyemi"
                      autoComplete="name"
                      required
                      className="bg-[#fffdf7]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="auth-studio">Studio</Label>
                    <Input
                      id="auth-studio"
                      value={studio}
                      onChange={(event) => setStudio(event.target.value)}
                      placeholder="Northlight Events"
                      autoComplete="organization"
                      className="bg-[#fffdf7]"
                    />
                  </div>
                </div>
              ) : null}

              <div className="space-y-1.5">
                <Label htmlFor="auth-email">Email</Label>
                <Input
                  id="auth-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@studio.com"
                  autoComplete="email"
                  required
                  className="bg-[#fffdf7]"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-baseline justify-between">
                  <Label htmlFor="auth-password">Password</Label>
                  {mode === "login" ? (
                    <span className="text-[11px] text-[#918b7e]">Stored on this device only</span>
                  ) : (
                    <span className="text-[11px] text-[#918b7e]">6+ characters</span>
                  )}
                </div>
                <div className="relative">
                  <Input
                    id="auth-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder={mode === "login" ? "Your password" : "Choose a password"}
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                    required
                    className="bg-[#fffdf7] pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-1 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded text-[#8a8478] transition-colors hover:bg-[#f1ece1] hover:text-[#171510]"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error ? (
                <p className="rounded-md border border-[#e8c5bc] bg-[#f9ece7] px-3 py-2 text-[12px] leading-5 text-[#943522]">
                  {error}
                </p>
              ) : null}

              <Button type="submit" size="lg" className="w-full gap-2" disabled={busy}>
                {mode === "login" ? "Sign in to studio" : "Create my studio"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            <div className="my-5 flex items-center gap-3">
              <span className="h-px flex-1 bg-[#dfd9cc]" />
              <span className="text-[10px] uppercase tracking-[0.16em] text-[#9a9488]">or</span>
              <span className="h-px flex-1 bg-[#dfd9cc]" />
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full gap-2"
              onClick={fillDemo}
              disabled={busy}
            >
              <Sparkles className="h-4 w-4" />
              Explore the demo studio
            </Button>
            <p className="mt-2.5 text-center text-[11px] text-[#8a8478]">
              Demo account · {DEMO_CREDENTIALS.email} · {DEMO_CREDENTIALS.password}
            </p>

            <p className="mt-7 text-center text-[12.5px] text-[#6f695e]">
              {mode === "login" ? "New to Hallcraft? " : "Already have a studio? "}
              <Link
                href={mode === "login" ? "/signup" : "/login"}
                className="font-medium text-[#171510] underline decoration-[#b9b1a2] underline-offset-4 transition-colors hover:decoration-[#171510]"
              >
                {mode === "login" ? "Create an account" : "Sign in instead"}
              </Link>
            </p>
          </div>
        </div>
      </div>

      <aside className="relative hidden overflow-hidden bg-[#0d4a45] p-8 text-[#d8f5ae] lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.18em] text-[#9fd3b8]">
          <span>Room 04 · Grand Hall</span>
          <span>Scale 1:100</span>
        </div>

        <div className="relative mx-auto my-8 w-full max-w-[520px]">
          <span className="absolute -left-4 top-10 z-10 rotate-[-4deg] rounded-md bg-[#ffd84d] px-2.5 py-1 text-[11px] font-medium text-[#2a2414] shadow-note">
            Stage sightline checked
          </span>
          <span className="absolute -right-2 top-1/3 z-10 rotate-[3deg] rounded-md bg-[#c9b5f7] px-2.5 py-1 text-[11px] font-medium text-[#2f2146] shadow-note">
            200 seats · 10 per table
          </span>
          <div className="overflow-hidden rounded-[10px] border border-[#cfe9d8]/30 bg-[#fbf8f1] shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)]">
            <FloorPlanPreview scene={scene} className="aspect-[26/34] w-full" />
          </div>
          <span className="absolute -bottom-3 left-8 rotate-[2deg] rounded-md bg-[#fbf8f1] px-3 py-1.5 text-[11px] font-medium text-[#242018] shadow-note">
            All entrances clear
          </span>
        </div>

        <div>
          <p className="max-w-md text-[clamp(1.7rem,2.6vw,2.5rem)] font-medium leading-[1.02] tracking-[-0.045em] text-[#f2fbe5]">
            Plan it once.
            <br />
            Walk it twice.
          </p>
          <div className="mt-8 flex items-center justify-between border-t border-[#cfe9d8]/20 pt-4 text-[11px] text-[#9fd3b8]">
            <span>Hallcraft spatial studio</span>
            <span>2D plans · venue checks · seating</span>
          </div>
        </div>
      </aside>
    </main>
  );
}
