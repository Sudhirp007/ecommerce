"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { 
  Building2, 
  ChevronRight, 
  Clock, 
  LogOut, 
  MapPin, 
  Package, 
  ShoppingBag, 
  User as UserIcon, 
  ShieldCheck 
} from "lucide-react";

export default function AccountPage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const { totalItems } = useCart();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=/account");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-stone-300 border-t-emerald-700"></div>
        <p className="mt-3 text-sm text-stone-500">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header Profile Banner */}
      <div className="bg-stone-900 rounded-2xl p-6 sm:p-8 text-white mb-8 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-emerald-700/40 border border-emerald-500/30 flex items-center justify-center text-2xl font-serif font-bold text-emerald-300">
            {user.name ? user.name[0]?.toUpperCase() : "U"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-serif font-bold">{user.name || "Apparel Member"}</h1>
              <span className="text-xs bg-emerald-950 text-emerald-400 border border-emerald-800/80 px-2 py-0.5 rounded-full font-medium">
                {user.role}
              </span>
            </div>
            <p className="text-sm text-stone-400 mt-0.5">{user.email}</p>
            {user.phone && <p className="text-xs text-stone-400">{user.phone}</p>}
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-1.5 px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium rounded-lg transition border border-stone-700"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>

      {/* Quick Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-stone-500">Orders</span>
            <Package className="w-4 h-4 text-emerald-700" />
          </div>
          <p className="text-2xl font-bold font-serif text-stone-900 mt-2">
            {user._count?.orders ?? 0}
          </p>
          <span className="text-xs text-stone-500">Total orders placed</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-stone-500">Addresses</span>
            <MapPin className="w-4 h-4 text-emerald-700" />
          </div>
          <p className="text-2xl font-bold font-serif text-stone-900 mt-2">
            {user._count?.addresses ?? 0}
          </p>
          <Link href="/account/addresses" className="text-xs text-emerald-700 hover:underline">
            Manage address book &rarr;
          </Link>
        </div>

        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-stone-500">Active Bag</span>
            <ShoppingBag className="w-4 h-4 text-emerald-700" />
          </div>
          <p className="text-2xl font-bold font-serif text-stone-900 mt-2">
            {totalItems}
          </p>
          <span className="text-xs text-stone-500">Items in current cart</span>
        </div>
      </div>

      {/* Account Navigation List */}
      <div className="bg-white rounded-2xl border border-stone-200 divide-y divide-stone-100 overflow-hidden shadow-sm">
        <Link
          href="/account/addresses"
          className="flex items-center justify-between p-4 sm:p-5 hover:bg-stone-50 transition"
        >
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-800">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-stone-900">Delivery Addresses</h2>
              <p className="text-xs text-stone-500">Add or manage shipping destinations and defaults</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-stone-400" />
        </Link>

        <div className="flex items-center justify-between p-4 sm:p-5 text-stone-400">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-lg bg-stone-100 text-stone-500">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-stone-700">Order History (Milestone 8)</h2>
              <p className="text-xs text-stone-500">Track shipments, receipts, and order statuses</p>
            </div>
          </div>
          <span className="text-xs font-medium text-stone-400 bg-stone-100 px-2 py-1 rounded">Coming Soon</span>
        </div>

        {user.role === "ADMIN" && (
          <div className="flex items-center justify-between p-4 sm:p-5 hover:bg-stone-50 transition">
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 rounded-lg bg-amber-50 text-amber-800">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-stone-900">Admin Control Panel</h2>
                <p className="text-xs text-stone-500">Catalog inventory, pricing, and system operations</p>
              </div>
            </div>
            <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200">
              Staff Portal (M7)
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
