"use client";

import React, { useState } from "react";
import type { User } from "@/types";
import { currentUserData } from "@/lib/mockData";

interface LoginPageProps {
  onLogin: (user: User) => void;
}

type Step = "main" | "join" | "signin";

export const LoginPage = ({ onLogin }: LoginPageProps) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<Step>("main");

  // join fields
  const [joinName, setJoinName] = useState("");
  const [joinEmail, setJoinEmail] = useState("");
  const [joinPassword, setJoinPassword] = useState("");

  // signin fields
  const [signEmail, setSignEmail] = useState("");
  const [signPassword, setSignPassword] = useState("");

  const [error, setError] = useState("");

  const go = (s: Step) => { setError(""); setStep(s); };

  const handleGoogleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin({ ...currentUserData, name: "GnoseonX User", email: "user@gmail.com", image: "" });
    }, 1500);
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!joinName || !joinEmail || !joinPassword) { setError("Please fill in all fields."); return; }
    if (joinName.trim().length < 2) { setError("Name must be at least 2 characters."); return; }
    if (joinPassword.length < 6) { setError("Password must be at least 6 characters."); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/users/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: joinName.trim(), email: joinEmail, password: joinPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Something went wrong."); setLoading(false); return; }
      onLogin({ ...currentUserData, id: data.id, name: data.displayName, email: data.email, image: "", status: "online" });
    } catch {
      setError("Connection error. Please try again.");
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!signEmail || !signPassword) { setError("Please fill in all fields."); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: signEmail, password: signPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Something went wrong."); setLoading(false); return; }
      onLogin({ ...currentUserData, id: data.id, name: data.displayName, email: data.email, image: "", status: "online" });
    } catch {
      setError("Connection error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex items-center justify-center bg-bg overflow-hidden relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-violet/5 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-neon/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-violet/3 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: "radial-gradient(circle, #9b30ff 1px, transparent 1px)",
          backgroundSize: "40px 40px"
        }} />
      </div>

      <div className="relative z-10 w-full max-w-md px-4">
        <div className="bg-surface rounded-3xl p-8 neu-card border border-violet/10 animate-slide-up">

          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-surface-2 neu-flat flex items-center justify-center mb-4 border border-violet/20">
              <span className="text-3xl font-mono text-violet">⌘</span>
            </div>
            <pre className="font-mono text-[9px] text-violet/80 leading-3 text-center select-none mb-1">
{`╔═══════════════╗
║  ◈ GnoseonX ◈ ║
╚═══════════════╝`}
            </pre>
            <p className="text-text-muted text-xs mt-1 font-mono">v2.0 — dark edition</p>
          </div>

          {/* ── MAIN ── */}
          {step === "main" && (
            <>
              <h1 className="text-xl font-semibold text-text-primary text-center mb-1">Welcome</h1>
              <p className="text-text-muted text-sm text-center mb-6">
                Sign in or create your account
              </p>

              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl
                           bg-surface-2 neu-btn border border-white/5 text-text-primary font-medium
                           hover:border-violet/30 hover:bg-surface-3 transition-all duration-200
                           disabled:opacity-50 disabled:cursor-not-allowed active:neu-btn-active mb-3"
              >
                {loading
                  ? <div className="w-5 h-5 border-2 border-violet/30 border-t-violet rounded-full animate-spin" />
                  : <GoogleIcon />}
                <span>{loading ? "Signing in..." : "Continue with Google"}</span>
              </button>

              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-surface-3" />
                <span className="text-text-muted text-xs font-mono">or</span>
                <div className="flex-1 h-px bg-surface-3" />
              </div>

              {/* two action buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => go("signin")}
                  className="flex-1 py-3 px-4 rounded-2xl bg-surface-2 neu-btn border border-white/5
                             text-text-secondary text-sm font-medium hover:border-violet/20 hover:text-text-primary
                             transition-all duration-200 active:neu-btn-active"
                >
                  Sign In
                </button>
                <button
                  onClick={() => go("join")}
                  className="flex-1 py-3 px-4 rounded-2xl bg-violet/10 neu-btn border border-violet/25
                             text-violet text-sm font-semibold hover:bg-violet/20 hover:border-violet/45
                             transition-all duration-200 active:neu-btn-active"
                >
                  Join to Gnoseon
                </button>
              </div>

              <button
                onClick={() => onLogin(currentUserData)}
                className="w-full mt-3 py-2.5 text-text-muted text-xs hover:text-violet transition-colors"
              >
                Continue as guest →
              </button>
            </>
          )}

          {/* ── SIGN IN ── */}
          {step === "signin" && (
            <>
              <button onClick={() => go("main")}
                className="flex items-center gap-1 text-text-muted text-xs mb-4 hover:text-text-primary transition-colors">
                ← Back
              </button>
              <h1 className="text-xl font-semibold text-text-primary text-center mb-1">Sign In</h1>
              <p className="text-text-muted text-xs text-center mb-6">
                Welcome back to{" "}
                <span className="text-violet font-mono">GnoseonX</span>
              </p>

              <form onSubmit={handleSignIn} className="space-y-3">
                <div>
                  <label className="text-text-muted text-xs font-mono mb-1 block">EMAIL</label>
                  <input
                    type="email"
                    value={signEmail}
                    onChange={(e) => setSignEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoFocus
                    className="w-full px-4 py-3 rounded-2xl bg-surface-2 neu-input border border-white/5
                               text-text-primary text-sm placeholder:text-text-muted
                               focus:outline-none focus:border-violet/40 transition-all"
                  />
                </div>
                <div>
                  <label className="text-text-muted text-xs font-mono mb-1 block">PASSWORD</label>
                  <input
                    type="password"
                    value={signPassword}
                    onChange={(e) => setSignPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-2xl bg-surface-2 neu-input border border-white/5
                               text-text-primary text-sm placeholder:text-text-muted
                               focus:outline-none focus:border-violet/40 transition-all"
                  />
                </div>

                {error && <p className="text-lava text-xs font-mono">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-2xl bg-violet text-white font-semibold
                             shadow-glow-v hover:bg-violet-600 transition-all duration-200
                             disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 mt-2
                             flex items-center justify-center gap-2"
                >
                  {loading
                    ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</>
                    : "Sign In →"}
                </button>
              </form>

              <p className="text-text-muted text-xs text-center mt-4">
                No account?{" "}
                <button onClick={() => go("join")} className="text-violet hover:underline">
                  Join Gnoseon
                </button>
              </p>
            </>
          )}

          {/* ── JOIN ── */}
          {step === "join" && (
            <>
              <button onClick={() => go("main")}
                className="flex items-center gap-1 text-text-muted text-xs mb-4 hover:text-text-primary transition-colors">
                ← Back
              </button>
              <h1 className="text-xl font-semibold text-text-primary text-center mb-1">Join to Gnoseon</h1>
              <p className="text-text-muted text-xs text-center mb-6 font-mono">
                You'll get a unique ID like{" "}
                <span className="text-violet">Gnoseon#AB1234</span>
              </p>

              <form onSubmit={handleJoin} className="space-y-3">
                <div>
                  <label className="text-text-muted text-xs font-mono mb-1 block">USERNAME</label>
                  <input
                    type="text"
                    value={joinName}
                    onChange={(e) => setJoinName(e.target.value)}
                    placeholder="e.g. Andi"
                    autoFocus
                    className="w-full px-4 py-3 rounded-2xl bg-surface-2 neu-input border border-white/5
                               text-text-primary text-sm placeholder:text-text-muted
                               focus:outline-none focus:border-violet/40 transition-all"
                  />
                </div>
                <div>
                  <label className="text-text-muted text-xs font-mono mb-1 block">EMAIL</label>
                  <input
                    type="email"
                    value={joinEmail}
                    onChange={(e) => setJoinEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-2xl bg-surface-2 neu-input border border-white/5
                               text-text-primary text-sm placeholder:text-text-muted
                               focus:outline-none focus:border-violet/40 transition-all"
                  />
                </div>
                <div>
                  <label className="text-text-muted text-xs font-mono mb-1 block">PASSWORD</label>
                  <input
                    type="password"
                    value={joinPassword}
                    onChange={(e) => setJoinPassword(e.target.value)}
                    placeholder="min. 6 characters"
                    className="w-full px-4 py-3 rounded-2xl bg-surface-2 neu-input border border-white/5
                               text-text-primary text-sm placeholder:text-text-muted
                               focus:outline-none focus:border-violet/40 transition-all"
                  />
                </div>

                {error && <p className="text-lava text-xs font-mono">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-2xl bg-violet text-white font-semibold
                             shadow-glow-v hover:bg-violet-600 transition-all duration-200
                             disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 mt-2
                             flex items-center justify-center gap-2"
                >
                  {loading
                    ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Joining...</>
                    : "Join Gnoseon ⚡"}
                </button>
              </form>

              <p className="text-text-muted text-xs text-center mt-4">
                Already have an account?{" "}
                <button onClick={() => go("signin")} className="text-violet hover:underline">
                  Sign In
                </button>
              </p>
            </>
          )}

          <p className="text-text-muted text-[10px] text-center mt-6 font-mono">
            By continuing you agree to our{" "}
            <span className="text-violet cursor-pointer hover:underline">Terms</span>
            {" & "}
            <span className="text-violet cursor-pointer hover:underline">Privacy</span>
          </p>
        </div>

        <p className="text-text-muted/30 text-[9px] font-mono text-center mt-4">
          ▸ GnoseonX Platform — All rights reserved ◂
        </p>
      </div>
    </div>
  );
};

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);
