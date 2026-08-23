"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "@/lib/firebase";
import { syncGoogleUserAction } from "@/actions/auth";
import { Lottie } from "lottie-react";
import hiAnimation from "@/public/animations/hi.json";

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
    <main className="min-h-screen bg-[#F5F7F8] flex items-center justify-center p-4">
      <div className="w-full max-w-md flex flex-col items-center">
        {/* Waving Girl Lottie Animation */}
        <div className="w-56 h-56 sm:w-64 sm:h-64 mb-1 relative z-10 pointer-events-none select-none">
          <Lottie src={hiAnimation} loop autoplay className="w-full h-full" />
        </div>

        {/* Login Card */}
        <div className="w-full bg-[#F5F7F8] border-2 border-black rounded-2xl p-6 sm:p-8 shadow-[4px_4px_0px_#000] sm:shadow-[6px_6px_0px_#000] relative z-0">
          <div className="mb-6 sm:mb-8">
            <span className="inline-block bg-[#00666B] text-white text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-widest border border-black">
              AIML · Karunya University
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-[#051B1D] leading-tight">
              Welcome to
              <br />
              <span className="text-[#00666B]">Matrix.</span>
            </h1>
            <p className="text-[#051B1D]/75 mt-2 text-xs sm:text-sm font-medium">
              Sign in with your Karunya college email to continue.
            </p>
          </div>

          {error && (
            <div className="mb-4 bg-red-100 border-2 border-red-500 rounded-xl px-4 py-3 text-red-700 text-xs sm:text-sm font-bold break-words">
              {error}
            </div>
          )}

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-[#F5F7F8] border-2 border-black rounded-xl px-4 py-3 font-bold text-sm sm:text-base text-[#051B1D] hover:bg-[#00666B] hover:text-white hover:border-black transition-all duration-200 shadow-[3px_3px_0px_#000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] disabled:opacity-50 disabled:cursor-not-allowed"
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

          <p className="text-center text-xs text-[#051B1D]/70 font-medium mt-6 break-words">
            Only @karunya.edu.in and @karunya.edu emails are allowed
          </p>
        </div>
      </div>
    </main>
  );
}
