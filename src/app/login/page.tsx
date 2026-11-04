"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ArrowRight, Lock, Mail, ShieldAlert } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/account";

  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const res = await login(email, password);
    setIsSubmitting(false);

    if (res.success) {
      router.push(redirect);
      router.refresh();
    } else {
      setError(res.error || "Failed to log in. Please check your credentials.");
    }
  };

  const fillDemoCredentials = () => {
    setEmail("customer@morningveg.com");
    setPassword("Password123!");
    setError(null);
  };

  return (
    <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl border border-stone-200 shadow-sm">
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full">
          Member Access
        </span>
        <h2 className="mt-3 text-3xl font-serif font-bold text-stone-900 tracking-tight">
          Sign in to your account
        </h2>
        <p className="mt-2 text-sm text-stone-600">
          Or{" "}
          <Link href="/register" className="font-medium text-emerald-700 hover:text-emerald-800 hover:underline">
            create a new customer account
          </Link>
        </p>
      </div>

      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2.5 text-sm text-rose-700">
          <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
              <Mail className="h-4 w-4" />
            </div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full pl-10 pr-3.5 py-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700">
              Password
            </label>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
              <Lock className="h-4 w-4" />
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-3.5 py-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-2 flex items-center justify-center gap-2 bg-stone-900 hover:bg-emerald-800 text-white font-medium py-3 rounded-lg text-sm transition shadow-sm disabled:opacity-50"
        >
          {isSubmitting ? "Signing in..." : "Sign In"}
          {!isSubmitting && <ArrowRight className="w-4 h-4" />}
        </button>
      </form>

      {/* Demo Account Quick-Fill Card */}
      <div className="pt-4 border-t border-stone-200">
        <div className="bg-stone-50 rounded-xl p-3.5 border border-stone-200">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-stone-700">Demo Seed Account:</span>
            <button
              type="button"
              onClick={fillDemoCredentials}
              className="text-emerald-700 hover:underline font-medium"
            >
              Auto-fill
            </button>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Email: <code className="bg-white px-1 py-0.5 rounded border border-stone-200">customer@morningveg.com</code><br/>
            Password: <code className="bg-white px-1 py-0.5 rounded border border-stone-200">Password123!</code>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Suspense
        fallback={
          <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-stone-200 shadow-sm text-center py-16">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-stone-300 border-t-emerald-700"></div>
            <p className="mt-2 text-xs text-stone-500">Loading sign-in portal...</p>
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
