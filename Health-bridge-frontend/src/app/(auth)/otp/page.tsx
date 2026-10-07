"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Shield, Clock, ArrowRight, Loader2, Lock } from "lucide-react";
import { authService } from "@/services/auth.service";

function OtpVerificationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(60); // 60s countdown
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [devOtp, setDevOtp] = useState<string | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
      if (typeof window !== "undefined") {
        const cached = sessionStorage.getItem(`dev_otp_${emailParam.trim().toLowerCase()}`);
        if (cached) {
          setDevOtp(cached);
        } else {
          setDevOtp(null);
        }
      }
    }
  }, [emailParam]);

  // Countdown timer
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  // Focus the first empty input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleDigitChange = (index: number, value: string) => {
    // Only accept single digit
    const cleaned = value.replace(/\D/g, "");
    if (!cleaned && value !== "") return;

    const newOtp = [...otp];
    newOtp[index] = cleaned ? cleaned.slice(-1) : "";
    setOtp(newOtp);
    setError(null);

    // Auto move to next input
    if (cleaned && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted) {
      const newOtp = [...otp];
      for (let i = 0; i < 6; i++) {
        newOtp[i] = pasted[i] || "";
      }
      setOtp(newOtp);
      const nextIndex = Math.min(pasted.length, 5);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  const fullOtp = otp.join("");

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (fullOtp.length !== 6) {
      setError("Please enter the complete 6-digit verification code");
      return;
    }

    if (!email) {
      setError("Email address is missing. Please go back to forgot password.");
      return;
    }

    setLoading(true);

    try {
      await authService.verifyOtp({
        email: email.trim(),
        otp: fullOtp,
      });

      if (typeof window !== "undefined") {
        sessionStorage.removeItem(`dev_otp_${email.trim().toLowerCase()}`);
      }

      // Route to reset password with email and otp parameters
      router.push(
        `/reset-password?email=${encodeURIComponent(
          email.trim()
        )}&otp=${encodeURIComponent(fullOtp)}`
      );
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        "Invalid or expired verification code. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || !email) return;
    setError(null);
    setSuccess(null);
    setResending(true);

    try {
      const res: any = await authService.forgotPassword(email.trim());
      const receivedDevOtp = res?.devOtp || res?.data?.devOtp;
      if (receivedDevOtp) {
        setDevOtp(receivedDevOtp);
        if (typeof window !== "undefined") {
          sessionStorage.setItem(`dev_otp_${email.trim().toLowerCase()}`, receivedDevOtp);
        }
      } else {
        setDevOtp(null);
        if (typeof window !== "undefined") {
          sessionStorage.removeItem(`dev_otp_${email.trim().toLowerCase()}`);
        }
      }
      setSuccess("A new 6-digit code has been generated and sent to your email!");
      setTimer(60);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to resend code. Please try again."
      );
    } finally {
      setResending(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <div className="w-full max-w-md bg-white rounded-3xl border border-slate-100 shadow-2xl p-8 sm:p-10 flex flex-col items-center text-center">
      {/* Top Shield Icon Badge */}
      <div className="w-14 h-14 rounded-full bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mb-6 shadow-sm">
        <Shield className="w-7 h-7 fill-blue-600/10 stroke-blue-600" />
      </div>

      <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
        Verify Your Identity
      </h1>

      <p className="mt-3 text-xs sm:text-sm text-slate-500 leading-relaxed max-w-xs">
        We&apos;ve sent a 6-digit security code to{" "}
        <span className="font-semibold text-slate-700">
          {email || "your registered email"}
        </span>
        . Please enter it below to continue.
      </p>

      {error && (
        <div className="mt-5 w-full p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2 text-left">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="mt-5 w-full p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium flex items-center gap-2 text-left">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
          {success}
        </div>
      )}

      {devOtp && (
        <div className="mt-5 w-full p-4 rounded-2xl bg-amber-50 border border-amber-200/90 text-amber-900 text-left shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
              <span>⚠️</span> Verification Code
            </span>
            <button
              type="button"
              onClick={() => {
                const chars = devOtp.split("").slice(0, 6);
                setOtp(chars);
                setError(null);
                inputRefs.current[5]?.focus();
              }}
              className="text-xs px-2.5 py-1 font-bold bg-amber-200 hover:bg-amber-300 text-amber-950 rounded-lg transition active:scale-95 shadow-sm cursor-pointer"
            >
              Auto-fill ({devOtp})
            </button>
          </div>
          <p className="mt-1.5 text-[11px] text-amber-800 leading-relaxed">
            Google SMTP daily quota is reached on the test email account. You can click <strong>Auto-fill</strong> or type the 6-digit code above to verify immediately.
          </p>
        </div>
      )}

      <form onSubmit={handleVerify} className="mt-8 w-full space-y-6">
        {/* 6 Digit Input Boxes */}
        <div className="flex items-center justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleDigitChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-14 sm:w-13 sm:h-16 text-center text-xl font-bold text-slate-800 rounded-xl border-2 border-blue-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-500/15 focus:outline-none transition-all shadow-sm bg-slate-50/50"
            />
          ))}
        </div>

        {/* Timer & Resend Row */}
        <div className="flex items-center justify-between text-xs font-medium pt-1 px-1">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>
              Code expires in{" "}
              <span className="font-bold text-emerald-600">
                {formatTimer(timer)}
              </span>
            </span>
          </div>

          <button
            type="button"
            onClick={handleResend}
            disabled={!canResend || resending}
            className={`font-semibold transition ${
              canResend
                ? "text-blue-600 hover:text-blue-700 cursor-pointer underline"
                : "text-slate-400 cursor-not-allowed"
            }`}
          >
            {resending ? "Sending..." : "Resend OTP"}
          </button>
        </div>

        {/* Verify Securely Button */}
        <button
          type="submit"
          disabled={loading || fullOtp.length !== 6}
          className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-semibold text-sm transition-all shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verifying...</span>
            </>
          ) : (
            <>
              <span>Verify Securely</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Footer Lock Badge */}
      <div className="mt-8 flex items-center gap-1.5 text-xs text-slate-400">
        <Lock className="w-3.5 h-3.5" />
        <span>Secure Healthcare Management</span>
      </div>
    </div>
  );
}

export default function OtpVerificationPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50">
      {/* Top Header */}
      <header className="w-full bg-white border-b border-slate-100 py-4 px-6 sm:px-12">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/login" className="font-bold text-xl text-blue-700 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs">
              HB
            </div>
            Health Bridge
          </Link>
          <Link
            href="/login"
            className="text-xs font-semibold text-slate-500 hover:text-blue-600 transition"
          >
            Cancel
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <Suspense
          fallback={
            <div className="p-8 text-center text-slate-500">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600" />
            </div>
          }
        >
          <OtpVerificationContent />
        </Suspense>
      </main>
    </div>
  );
}
