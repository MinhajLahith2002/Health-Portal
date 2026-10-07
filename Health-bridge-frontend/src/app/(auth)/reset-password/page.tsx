"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Eye, EyeOff, CheckCircle2, Loader2, ArrowLeft } from "lucide-react";
import HeaderLogo from "@/components/HeaderLogo";
import AuthFooter from "@/components/AuthFooter";
import { authService } from "@/services/auth.service";
import { saveAuthData } from "@/lib/auth";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";
  const otpParam = searchParams.get("otp") || "";

  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState(otpParam);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (emailParam) setEmail(emailParam);
    if (otpParam) setOtp(otpParam);
  }, [emailParam, otpParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!email || !otp) {
      setError("Missing verification details. Please restart from the Forgot Password page.");
      return;
    }

    setLoading(true);

    try {
      const data = await authService.resetPassword({
        email: email.trim(),
        otp: otp.trim(),
        newPassword,
        confirmPassword,
      });

      saveAuthData(data.token, {
        id: data.id,
        fullName: data.fullName,
        email: data.email,
        role: data.role,
      });

      setSuccess("Your password has been successfully reset! Redirecting to dashboard...");
      setTimeout(() => {
        router.push("/patient/dashboard");
      }, 1500);
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        "Password reset failed. Please check your verification code and try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-3xl border border-slate-100 shadow-xl p-8 sm:p-10 flex flex-col items-center">
      {/* Top Badge */}
      <div className="w-14 h-14 rounded-full bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mb-6 shadow-sm">
        <Lock className="w-6 h-6" />
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight text-center">
        Create New Password
      </h1>

      <p className="mt-2 text-xs sm:text-sm text-slate-500 text-center leading-relaxed">
        Set a strong password for{" "}
        <span className="font-semibold text-slate-700">{email}</span>
      </p>

      {error && (
        <div className="mt-5 w-full p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2 text-left">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="mt-5 w-full p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium flex items-center gap-2 text-left">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 w-full space-y-4 text-left">
        {/* Verification Code Check (hidden if present) */}
        {!otpParam && (
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Verification Code (OTP)
            </label>
            <input
              type="text"
              required
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6-digit code"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 text-sm text-slate-800 transition"
            />
          </div>
        )}

        {/* New Password */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            New Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 pr-10 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 text-sm text-slate-800 placeholder-slate-400 transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Must be at least 8 characters</p>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 pr-10 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 text-sm text-slate-800 placeholder-slate-400 transition"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition"
            >
              {showConfirmPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-semibold text-sm transition-all shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Resetting Password...</span>
              </>
            ) : (
              "Save New Password"
            )}
          </button>
        </div>
      </form>

      <div className="mt-6">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 hover:text-blue-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      {/* Top Header */}
      <header className="w-full bg-white border-b border-slate-100 py-4 px-6 sm:px-12">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <HeaderLogo />
          <Link
            href="/login"
            className="text-xs font-semibold text-slate-500 hover:text-blue-600 transition"
          >
            Login
          </Link>
        </div>
      </header>

      {/* Main Form Center */}
      <main className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <Suspense
          fallback={
            <div className="p-8 text-center text-slate-500">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600" />
            </div>
          }
        >
          <ResetPasswordContent />
        </Suspense>
      </main>

      <AuthFooter />
    </div>
  );
}
