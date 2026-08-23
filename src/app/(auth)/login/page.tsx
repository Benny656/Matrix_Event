"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "@/lib/firebase";
import { syncGoogleUserAction } from "@/actions/auth";

const HiAnimation = dynamic(
  () => import("@/components/shared/hi-animation"),
  {
    ssr: false,
    loading: () => (
      <div className="w-44 h-44 sm:w-56 sm:h-56 lg:w-64 lg:h-64 rounded-2xl bg-[hsl(var(--surface-2))]/40 animate-pulse" />
    ),
  },
);

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGoogleLogin() {
    try {
      setLoading(true);
      setError("");
      const result = await signInWithPopup(auth, provider);
      const { uid, email, displayName } = result.user;
      const idToken = await result.user.getIdToken();
      await syncGoogleUserAction(
        uid,
        email!,
        displayName || "",
        idToken,
      );

      const verifyRes = await fetch("/api/auth/verify");
      if (verifyRes.ok) {
        const { role, onboardingCompleted } = await verifyRes.json();
        if (role === "ADMIN") {
          router.push("/admin");
        } else if (role === "VOLUNTEER") {
          router.push("/volunteer");
        } else if (!onboardingCompleted) {
          router.push("/onboarding");
        } else {
          router.push("/student");
        }
      } else {
        router.push("/onboarding");
      }
    } catch (e: any) {
      setError(e.message || "Sign in failed. Use your Karunya college email.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))] px-4 sm:px-6 py-10 relative overflow-hidden">
      {/* Ambient gradient orb */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[hsl(var(--accent)/0.12)] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[hsl(var(--accent-light)/0.1)] rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        {/* Left Column: Greeting & Hi Animation */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[hsl(var(--accent-subtle))] text-[hsl(var(--accent))] border border-[hsl(var(--accent)/0.2)] mb-4">
            AIML · Karunya University
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[hsl(var(--text-primary))] leading-tight">
            Welcome to
            <br />
            <span className="text-[hsl(var(--accent))]">Matrix.</span>
          </h1>
          <p className="mt-3 text-sm sm:text-base text-[hsl(var(--text-secondary))] max-w-md leading-relaxed">
            Sign in with your Karunya college email to continue.
          </p>

          {/* Hi Girl Character Animation */}
          <div className="w-44 h-44 sm:w-56 sm:h-56 lg:w-64 lg:h-64 mt-4 lg:mt-6 flex items-center justify-center pointer-events-none shrink-0">
            <HiAnimation className="w-full h-full object-contain" />
          </div>
        </div>

        {/* Right Column / Card */}
        <div className="w-full max-w-md mx-auto lg:max-w-none">
          <div className="glass rounded-2xl border border-[hsl(var(--border))] p-6 sm:p-10 shadow-xl">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-[hsl(var(--text-primary))]">
                Sign In
              </h2>
              <p className="text-sm text-[hsl(var(--text-secondary))] mt-1">
                Access your account to proceed
              </p>
            </div>

            {error && (
              <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-xl px-4 py-3 break-words">
                {error}
              </div>
            )}

            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 border border-gray-200 rounded-xl px-4 py-3 font-semibold text-sm hover:shadow-md hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
              ) : (
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              <span>{loading ? "Signing in..." : "Continue with Google"}</span>
            </button>

            <p className="text-center text-xs text-[hsl(var(--text-tertiary))] font-normal mt-6 leading-relaxed">
              Only @karunya.edu.in and @karunya.edu emails are allowed
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
