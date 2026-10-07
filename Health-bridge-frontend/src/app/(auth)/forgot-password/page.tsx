"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RotateCw, ArrowLeft, Loader2 } from "lucide-react";
import HeaderLogo from "@/components/HeaderLogo";
import AuthFooter from "@/components/AuthFooter";
import { authService } from "@/services/auth.service";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Please enter your registered email address");
      return;
    }

    setLoading(true);

    try {
      const res: any = await authService.forgotPassword(email.trim());
      const devOtp = res?.devOtp || res?.data?.devOtp;
      if (typeof window !== "undefined") {
        if (devOtp) {
          sessionStorage.setItem(`dev_otp_${email.trim().toLowerCase()}`, devOtp);
        } else {
          sessionStorage.removeItem(`dev_otp_${email.trim().toLowerCase()}`);
        }
      }
      // Direct user to the OTP verification page with the email in query parameters
      router.push(`/otp?email=${encodeURIComponent(email.trim())}`);
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        "Unable to send verification code. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Top Header */}
      <header className="w-full bg-white border-b border-slate-100 py-4 px-6 sm:px-12">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <HeaderLogo />
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-semibold text-blue-700 hover:text-blue-800 transition"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition shadow-sm shadow-blue-500/20"
            >
              Register
            </Link>
          </div>
        </div>
      </header>

      {/* Main Form Center */}
      <main className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 shadow-xl p-8 sm:p-10 flex flex-col items-center text-center">
          {/* Top Badge Icon */}
          <div className="w-14 h-14 rounded-full bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mb-6 shadow-sm">
            <RotateCw className="w-6 h-6" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Forgot Your Password?
          </h1>

          <p className="mt-3 text-xs sm:text-sm text-slate-500 leading-relaxed max-w-xs">
            Enter your email address and we&apos;ll send you a link to reset
            your password.
          </p>

          {error && (
            <div className="mt-5 w-full p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2 text-left">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 w-full space-y-5 text-left">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 text-sm text-slate-800 placeholder-slate-400 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-semibold text-sm transition-all shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending Code...</span>
                </>
              ) : (
                "Send Reset Link"
              )}
            </button>
          </form>

          {/* Back to login */}
          <div className="mt-8">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-800 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
          </div>
        </div>
      </main>

      <AuthFooter />
    </div>
  );
}
