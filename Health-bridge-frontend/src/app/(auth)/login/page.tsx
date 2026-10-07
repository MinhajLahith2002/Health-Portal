"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, KeyRound, Eye, EyeOff, Loader2 } from "lucide-react";
import HeaderLogo from "@/components/HeaderLogo";
import HealthcareIllustration from "@/components/HealthcareIllustration";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import { authService } from "@/services/auth.service";
import { saveAuthData, getRoleRedirectPath, getToken, getStoredUser, clearAuthData } from "@/lib/auth";

// ✅ Define error type properly
interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if already logged in
  useEffect(() => {
    const token = getToken();
    const user = getStoredUser();
    if (token && user?.role) {
      router.replace(getRoleRedirectPath(user.role));
    } else if (token || user) {
      clearAuthData();
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password");
      return;
    }

    setLoading(true);

    try {
      const data = await authService.login({
        email: email.trim(),
        password: password.trim(),
      });

      saveAuthData(data.token, {
        id: data.id,
        fullName: data.fullName,
        email: data.email,
        role: data.role,
      });

      const requestedRedirect = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("redirect") : null;
      const targetPath = requestedRedirect && requestedRedirect.startsWith("/") ? requestedRedirect : getRoleRedirectPath(data.role);
      router.push(targetPath);
    } catch (err: unknown) {
      // ✅ Proper error handling without 'any'
      const apiError = err as ApiError;
      let message =
        apiError.response?.data?.message ||
        "Invalid email or password. Please try again.";
      if (typeof message === "string" && message.toLowerCase().includes("operation successful")) {
        message = "Operation unsuccessful";
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <HeaderLogo />
        <Link
          href="/register"
          className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all shadow-sm shadow-blue-500/20"
        >
          Register
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-6xl rounded-3xl border-2 border-blue-400/80 bg-white p-6 sm:p-10 lg:p-12 shadow-xl shadow-blue-500/5 relative overflow-hidden">
          <div className="absolute top-4 left-4 w-20 h-20 opacity-20 pointer-events-none bg-[radial-gradient(#0284c7_1px,transparent_1px)] [background-size:8px_8px]" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 flex flex-col justify-between space-y-8">
              <div>
                <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                  Smart Healthcare. <br />
                  Stronger{" "}
                  <span className="text-cyan-500">Connections.</span>
                </h1>
                <p className="mt-5 text-slate-500 text-base sm:text-lg max-w-md leading-relaxed">
                  Health Bridge connects patient, and <br />
                  Data Seamlessly for better care and outcomes.
                </p>
                <div className="w-16 h-1 bg-cyan-500 rounded-full mt-4" />
              </div>
              <div className="pt-2">
                <HealthcareIllustration />
              </div>
            </div>

            <div className="lg:col-span-6 flex justify-center">
              <div className="w-full max-w-md bg-white rounded-3xl border border-slate-100 shadow-xl p-8 sm:p-10">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    Welcome Back
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    Sign in to access your healthcare dashboard
                  </p>
                </div>

                {error && (
                  <div className="mb-6 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email Address"
                        autoComplete="email"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 text-sm text-slate-800 placeholder-slate-400 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <KeyRound className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        autoComplete="current-password"
                        className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 text-sm text-slate-800 placeholder-slate-400 transition"
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
                  </div>

                  <div className="flex justify-end pt-1">
                    <Link
                      href="/forgot-password"
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline transition cursor-pointer"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-semibold text-sm transition-all shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Signing in...</span>
                      </>
                    ) : (
                      "Log in"
                    )}
                  </button>
                </form>

                <div className="mt-6 text-center text-xs text-slate-500">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/register"
                    className="font-bold text-blue-700 hover:underline"
                  >
                    Sign up
                  </Link>
                </div>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-100" />
                  </div>
                  <div className="relative flex justify-center text-[11px] text-slate-400">
                    <span className="bg-white px-3">Or continue with</span>
                  </div>
                </div>

                <div className="flex justify-center">
                  <GoogleSignInButton
                    variant="icon"
                    onError={(msg) => setError(msg)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
