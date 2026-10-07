"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { authService } from "@/services/auth.service";
import { saveAuthData, getRoleRedirectPath } from "@/lib/auth";

interface GoogleSignInButtonProps {
  variant?: "icon" | "full";
  onError?: (errorMessage: string) => void;
  className?: string;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: any) => void;
            error_callback?: (error: any) => void;
          }) => {
            requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
          };
        };
        id: {
          initialize: (config: any) => void;
          prompt: (notification?: any) => void;
          renderButton: (parent: HTMLElement, options: any) => void;
        };
      };
    };
  }
}

export default function GoogleSignInButton({
  variant = "icon",
  onError,
  className = "",
}: GoogleSignInButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const clientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    "868011706916-4ck61kvgri6up58b8gj1c1lp1pmov3q0.apps.googleusercontent.com";

  const handleGoogleClick = async () => {
    setLoading(true);

    // Helper function to handle the token returned by Google
    const handleAuthSuccess = async (token: string) => {
      try {
        let email: string | undefined;
        let name: string | undefined;

        // Try pre-fetching userinfo directly from Google using access token for seamless fallback
        try {
          const userinfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (userinfoRes.ok) {
            const profile = await userinfoRes.json();
            email = profile.email;
            name = profile.name;
          }
        } catch (fetchErr) {
          console.warn("Could not pre-fetch Google userinfo:", fetchErr);
        }

        const data = await authService.googleAuth(token, email, name);
        saveAuthData(data.token, {
          id: data.id,
          fullName: data.fullName,
          email: data.email,
          role: data.role,
        });

        const targetPath = getRoleRedirectPath(data.role);
        router.push(targetPath);
      } catch (err: any) {
        console.error("Google Auth error:", err);
        const msg =
          err.response?.data?.message ||
          err.message ||
          "Failed to complete Google authentication with server.";
        onError?.(msg);
      } finally {
        setLoading(false);
      }
    };

    // Ensure Google script is loaded
    if (typeof window === "undefined" || !window.google?.accounts?.oauth2) {
      // If script is not ready yet, try loading it dynamically
      try {
        await new Promise<void>((resolve, reject) => {
          if (window.google?.accounts?.oauth2) return resolve();
          const script = document.createElement("script");
          script.src = "https://accounts.google.com/gsi/client";
          script.async = true;
          script.defer = true;
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Failed to load Google SDK"));
          document.body.appendChild(script);
        });
      } catch (e: any) {
        setLoading(false);
        onError?.("Google authentication service is currently unavailable. Please check your internet connection.");
        return;
      }
    }

    try {
      if (window.google?.accounts?.oauth2) {
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: "email profile openid",
          callback: async (tokenResponse: any) => {
            if (tokenResponse.error) {
              setLoading(false);
              onError?.(tokenResponse.error_description || tokenResponse.error || "Google sign-in was cancelled");
              return;
            }
            if (tokenResponse.access_token) {
              await handleAuthSuccess(tokenResponse.access_token);
            } else {
              setLoading(false);
            }
          },
          error_callback: (err: any) => {
            setLoading(false);
            onError?.(err?.message || "Google sign-in window closed or encountered an error");
          },
        });

        // Trigger Google popup prompt
        tokenClient.requestAccessToken({ prompt: "select_account" });
      } else {
        setLoading(false);
        onError?.("Google sign-in client is initializing. Please try again in a moment.");
      }
    } catch (err: any) {
      setLoading(false);
      onError?.(err.message || "An error occurred while opening Google Sign-In");
    }
  };

  const GoogleIcon = () => (
    <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );

  if (variant === "full") {
    return (
      <button
        type="button"
        onClick={handleGoogleClick}
        disabled={loading}
        className={`w-full py-3.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 text-slate-700 font-semibold text-sm transition-all shadow-sm flex items-center justify-center gap-3 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed ${className}`}
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            <span>Connecting to Google...</span>
          </>
        ) : (
          <>
            <GoogleIcon />
            <span>Continue with Google</span>
          </>
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleGoogleClick}
      disabled={loading}
      title="Sign in with Google"
      className={`w-14 h-14 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 shadow-sm flex items-center justify-center transition active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed ${className}`}
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
      ) : (
        <GoogleIcon />
      )}
    </button>
  );
}
