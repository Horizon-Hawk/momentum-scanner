"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { X, Eye, EyeOff, TrendingUp } from "lucide-react";

interface Props {
  onClose: () => void;
}

export function AuthModal({ onClose }: Props) {
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [signupDone, setSignupDone] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (tab === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      onClose();
      router.push("/dashboard");
      router.refresh();
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${location.origin}/auth/callback`,
        },
      });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      setSignupDone(true);
      setLoading(false);
    }
  }

  const switchTab = (t: "signin" | "signup") => {
    setTab(t);
    setError("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-950/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-sm bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-300 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-green-400 font-bold mb-6">
          <TrendingUp className="w-5 h-5" />
          MomentumScan
        </div>

        {signupDone ? (
          <div className="text-center py-4">
            <p className="text-gray-100 font-semibold mb-2">Check your email</p>
            <p className="text-sm text-gray-400 leading-relaxed">
              We sent a confirmation link to{" "}
              <span className="text-gray-200">{email}</span>.
              Click it to activate your account.
            </p>
            <button
              onClick={onClose}
              className="mt-6 text-sm text-gray-500 hover:text-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="flex bg-gray-800 rounded-lg p-1 mb-6">
              <button
                onClick={() => switchTab("signin")}
                className={`flex-1 text-sm font-medium py-1.5 rounded-md transition-colors ${
                  tab === "signin"
                    ? "bg-gray-900 text-gray-100 shadow-sm"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                Sign in
              </button>
              <button
                onClick={() => switchTab("signup")}
                className={`flex-1 text-sm font-medium py-1.5 rounded-md transition-colors ${
                  tab === "signup"
                    ? "bg-gray-900 text-gray-100 shadow-sm"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                Create account
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-medium text-gray-400 mb-1.5 block">
                  Email
                </label>
                <input
                  type="email"
                  required
                  autoFocus
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-green-500 transition-colors"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-400 mb-1.5 block">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    autoComplete={tab === "signin" ? "current-password" : "new-password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 pr-10 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-green-500 transition-colors"
                    placeholder={tab === "signup" ? "Min. 6 characters" : "••••••••"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-500 hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed text-gray-950 font-bold py-2.5 rounded-lg transition-colors text-sm"
              >
                {loading
                  ? "Please wait…"
                  : tab === "signin"
                  ? "Sign in"
                  : "Create account"}
              </button>
            </form>

            {tab === "signin" && (
              <p className="text-center text-xs text-gray-600 mt-4">
                No account?{" "}
                <button
                  onClick={() => switchTab("signup")}
                  className="text-green-400 hover:text-green-300 transition-colors"
                >
                  Create one free
                </button>
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
