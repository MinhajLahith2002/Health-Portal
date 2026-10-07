"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  KeyRound,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  Activity,
  HeartPulse,
  ArrowLeft,
  MapPin,
} from "lucide-react";
import HeaderLogo from "@/components/HeaderLogo";
import RegisterIllustration from "@/components/RegisterIllustration";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import { authService } from "@/services/auth.service";
import { saveAuthData, getRoleRedirectPath } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    branch: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const isPasswordValid = formData.password.length >= 8;
  const isPasswordMatch =
    formData.confirmPassword.length > 0 &&
    formData.password === formData.confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const data = await authService.register({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        branch: formData.branch,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      saveAuthData(data.token, {
        id: data.id,
        fullName: data.fullName,
        email: data.email,
        role: data.role,
      });

      setSuccess("Account created successfully! Redirecting to your dashboard...");
      const targetPath = getRoleRedirectPath(data.role);
      setTimeout(() => {
        router.push(targetPath);
      }, 1000);
    } catch (err: any) {
      let message =
        err.response?.data?.message ||
        "Registration failed. Please check your information.";
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
      {/* Top Navigation Bar */}
      <header className="w-full max-w-7xl mx-auto px-6 pt-6 pb-2 flex flex-col items-start gap-2.5">
        <HeaderLogo />
        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200/80 hover:border-blue-200 text-sm font-semibold text-slate-700 hover:text-blue-600 transition-all shadow-sm group"
        >
          <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:text-blue-600 group-hover:-translate-x-1 transition-all" />
          <span>Back to Login</span>
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-6xl rounded-3xl border-2 border-blue-400/80 bg-white p-6 sm:p-10 lg:p-12 shadow-xl shadow-blue-500/5 relative overflow-hidden">
          {/* Subtle Grid Accent Top Left */}
          <div className="absolute top-4 left-4 w-20 h-20 opacity-20 pointer-events-none bg-[radial-gradient(#0284c7_1px,transparent_1px)] [background-size:8px_8px]" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Hero Column */}
            <div className="lg:col-span-6 flex flex-col justify-between space-y-8">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold mb-4">
                  <HeartPulse className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                  <span>Join Health Bridge Network</span>
                </div>

                <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                  Start Your Care <br />
                  Journey <span className="text-cyan-500">Today.</span>
                </h1>

                <p className="mt-5 text-slate-500 text-base sm:text-lg max-w-md leading-relaxed">
                  Join Health Bridge for instant access to certified doctors, unified electronic records, and streamlined care.
                </p>

                <div className="w-16 h-1 bg-cyan-500 rounded-full mt-4" />
              </div>

              {/* Graphic Illustration */}
              <div className="pt-2">
                <RegisterIllustration />
              </div>
            </div>

            {/* Right Register Card Column */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="w-full max-w-md bg-white rounded-3xl border border-slate-100 shadow-xl p-8 sm:p-10">
                <div className="text-center mb-6">
                  <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    Create an Account
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    Sign up to access your personalized health portal
                  </p>
                </div>

                {error && (
                  <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                    {error}
                  </div>
                )}

                {success && (
                  <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    {success}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3.5">
                  {/* Full Name */}
                  <div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        name="fullName"
                        required
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="Full Name"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 text-sm text-slate-800 placeholder-slate-400 transition bg-slate-50/30 focus:bg-white"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Email Address"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 text-sm text-slate-800 placeholder-slate-400 transition bg-slate-50/30 focus:bg-white"
                      />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        type="tel"
                        name="phoneNumber"
                        required
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        placeholder="Phone Number"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 text-sm text-slate-800 placeholder-slate-400 transition bg-slate-50/30 focus:bg-white"
                      />
                    </div>
                  </div>

                  {/* Branch */}
                  <div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <select
                        name="branch"
                        required
                        value={formData.branch}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 text-sm transition bg-slate-50/30 focus:bg-white appearance-none cursor-pointer ${
                          formData.branch ? "text-slate-800" : "text-slate-400"
                        }`}
                      >
                        <option value="" disabled>Select Branch</option>
                        <option value="Colombo">Colombo</option>
                        <option value="Gampaha">Gampaha</option>
                        <option value="Kalutara">Kalutara</option>
                        <option value="Kegalle">Kegalle</option>
                        <option value="Ratnapura">Ratnapura</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <KeyRound className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Password (min 8 chars)"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 text-sm text-slate-800 placeholder-slate-400 transition bg-slate-50/30 focus:bg-white"
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

                  {/* Confirm Password */}
                  <div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <KeyRound className="w-4 h-4" />
                      </div>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        required
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm Password"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 text-sm text-slate-800 placeholder-slate-400 transition bg-slate-50/30 focus:bg-white"
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

                    {/* Dynamic helper badge */}
                    {formData.password.length > 0 && (
                      <div className="flex items-center gap-3 mt-1.5 text-[11px]">
                        <span
                          className={`flex items-center gap-1 transition-colors ${
                            isPasswordValid
                              ? "text-emerald-600 font-medium"
                              : "text-slate-400"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isPasswordValid ? "bg-emerald-500" : "bg-slate-300"
                            }`}
                          />
                          8+ characters
                        </span>

                        {formData.confirmPassword.length > 0 && (
                          <span
                            className={`flex items-center gap-1 transition-colors ${
                              isPasswordMatch
                                ? "text-emerald-600 font-medium"
                                : "text-amber-600 font-medium"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isPasswordMatch ? "bg-emerald-500" : "bg-amber-500"
                              }`}
                            />
                            {isPasswordMatch ? "Passwords match" : "Must match"}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-semibold text-sm transition-all shadow-md shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Creating Account...</span>
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </button>
                  </div>
                </form>

                {/* Log In Link */}
                <div className="mt-5 text-center text-xs text-slate-500">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="font-bold text-blue-700 hover:underline"
                  >
                    Log in
                  </Link>
                </div>

                {/* Or continue with */}
                <div className="relative my-5">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-100" />
                  </div>
                  <div className="relative flex justify-center text-[11px] text-slate-400">
                    <span className="bg-white px-3">Or continue with</span>
                  </div>
                </div>

                {/* Google Sign In Button */}
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


