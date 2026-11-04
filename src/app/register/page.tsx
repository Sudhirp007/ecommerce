"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ArrowRight, Lock, Mail, Phone, ShieldAlert, User } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsSubmitting(true);
    const res = await register({ name, email, password, phone });
    setIsSubmitting(false);

    if (res.success) {
      router.push("/account");
      router.refresh();
    } else {
      setError(res.error || "Failed to create account. Please check the information provided.");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl border border-stone-200 shadow-sm">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full">
            New Customer
          </span>
          <h2 className="mt-3 text-3xl font-serif font-bold text-stone-900 tracking-tight">
            Create an Account
          </h2>
          <p className="mt-2 text-sm text-stone-600">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-emerald-700 hover:text-emerald-800 hover:underline">
              Sign in here
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
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                <User className="h-4 w-4" />
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Rohit Sharma"
                className="w-full pl-10 pr-3.5 py-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
              />
            </div>
          </div>

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
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
              Phone Number (Optional)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                <Phone className="h-4 w-4" />
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full pl-10 pr-3.5 py-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full pl-10 pr-3.5 py-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                className="w-full pl-10 pr-3.5 py-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-4 flex items-center justify-center gap-2 bg-stone-900 hover:bg-emerald-800 text-white font-medium py-3 rounded-lg text-sm transition shadow-sm disabled:opacity-50"
          >
            {isSubmitting ? "Creating account..." : "Complete Registration"}
            {!isSubmitting && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
}
