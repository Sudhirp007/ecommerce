"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { ShoppingBag, Search, Menu, X, User } from "lucide-react";

export function Header() {
  const router = useRouter();
  const { totalItems, openCart } = useCart();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setMobileMenuOpen(false);
    }
  };

  const navCategories = [
    { name: "T-Shirts", href: "/category/t-shirts" },
    { name: "Shirts", href: "/category/shirts" },
    { name: "Bottoms", href: "/category/bottoms" },
    { name: "Knitwear", href: "/category/knitwear" },
    { name: "Accessories", href: "/category/accessories" },
  ];

  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur sticky top-0 z-40 transition">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Mobile Hamburger */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-tight text-emerald-800">MorningVeg</span>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
              Apparel
            </span>
          </Link>
        </div>

        {/* Desktop Category Navigation */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-600">
          {navCategories.map((c) => (
            <Link
              key={c.name}
              href={c.href}
              className="hover:text-emerald-700 transition"
            >
              {c.name}
            </Link>
          ))}
        </nav>

        {/* Search & Cart Actions */}
        <div className="flex items-center gap-3">
          {/* Search Input */}
          <form onSubmit={handleSearch} className="relative hidden sm:block w-48 lg:w-64">
            <input
              type="text"
              placeholder="Search apparel..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-2 bg-slate-100 border border-slate-200 rounded-full focus:outline-hidden focus:border-emerald-600 focus:bg-white transition"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </form>

          {/* User Account Link */}
          {user ? (
            <Link
              href="/account"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 transition text-xs font-medium"
              title={`Logged in as ${user.name || user.email}`}
            >
              <div className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px] font-bold">
                {user.name ? user.name[0]?.toUpperCase() : "U"}
              </div>
              <span className="hidden lg:inline">{user.name?.split(" ")[0] || "Account"}</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-emerald-700 px-3 py-1.5 rounded-full hover:bg-slate-100 transition"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Sign In</span>
            </Link>
          )}

          {/* Cart Drawer Trigger */}
          <button
            type="button"
            onClick={openCart}
            className="relative p-2.5 rounded-full bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 transition flex items-center justify-center cursor-pointer"
            aria-label={`View Cart with ${totalItems} items`}
          >
            <ShoppingBag className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-emerald-600 text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-xs animate-in zoom-in">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white p-4 space-y-3">
          <form onSubmit={handleSearch} className="relative w-full">
            <input
              type="text"
              placeholder="Search apparel..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-2.5 bg-slate-100 border border-slate-200 rounded-lg focus:outline-hidden focus:border-emerald-600"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-3" />
          </form>

          <div className="flex flex-col space-y-2 pt-2">
            {user ? (
              <Link
                href="/account"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 text-emerald-800 text-sm font-semibold"
              >
                <User className="w-4 h-4" />
                <span>My Account ({user.name || user.email})</span>
              </Link>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 text-slate-800 text-sm font-medium hover:bg-emerald-50 hover:text-emerald-700 transition"
              >
                <User className="w-4 h-4" />
                <span>Sign In / Register</span>
              </Link>
            )}

            {navCategories.map((c) => (
              <Link
                key={c.name}
                href={c.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition"
              >
                {c.name}
              </Link>
            ))}
            <Link
              href="/api/health"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 text-xs font-semibold text-slate-400 hover:text-slate-600"
            >
              Live Health Check API
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
