"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, Check, MapPin, Plus, Trash2, X } from "lucide-react";

interface Address {
  id: string;
  fullName: string;
  phone: string;
  street: string;
  landmark: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefaultShipping: boolean;
  isDefaultBilling: boolean;
}

export default function AddressesPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [fetching, setFetching] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    street: "",
    landmark: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    isDefaultShipping: true,
  });

  const loadAddresses = useCallback(async () => {
    try {
      setFetching(true);
      const res = await fetch("/api/account/addresses");
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setAddresses(data.addresses);
        }
      }
    } catch (err) {
      console.error("Failed to load addresses:", err);
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?redirect=/account/addresses");
    } else if (user) {
      loadAddresses();
    }
  }, [loading, user, router, loadAddresses]);

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/account/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      setSubmitting(false);

      if (res.ok && data.success) {
        setShowAddModal(false);
        setFormData({
          fullName: "",
          phone: "",
          street: "",
          landmark: "",
          city: "",
          state: "",
          postalCode: "",
          country: "India",
          isDefaultShipping: addresses.length === 0,
        });
        await loadAddresses();
      } else {
        setError(data.error || "Failed to save address");
      }
    } catch {
      setSubmitting(false);
      setError("Network error while saving address");
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (!confirm("Are you sure you want to remove this delivery address?")) return;

    try {
      const res = await fetch(`/api/account/addresses/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setAddresses((prev) => prev.filter((a) => a.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete address:", err);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const res = await fetch(`/api/account/addresses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefaultShipping: true }),
      });
      if (res.ok) {
        await loadAddresses();
      }
    } catch (err) {
      console.error("Failed to set default address:", err);
    }
  };

  if (loading || (!user && fetching)) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-stone-300 border-t-emerald-700"></div>
        <p className="mt-3 text-sm text-stone-500">Loading address book...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link
            href="/account"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-500 hover:text-stone-800 transition mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Account
          </Link>
          <h1 className="text-2xl font-serif font-bold text-stone-900">Delivery Address Book</h1>
          <p className="text-xs text-stone-600 mt-0.5">Manage your shipping destinations for rapid checkout</p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 bg-stone-900 hover:bg-emerald-800 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Address
        </button>
      </div>

      {/* Address Grid */}
      {fetching ? (
        <div className="py-12 text-center text-sm text-stone-500">Refreshing addresses...</div>
      ) : addresses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400 mb-3">
            <MapPin className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-stone-900">No saved addresses yet</h3>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            Add a shipping address so you can breeze through order checkout without typing details repeatedly.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 inline-flex items-center gap-1.5 bg-stone-900 text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-emerald-800 transition"
          >
            <Plus className="w-3.5 h-3.5" /> Add First Address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`bg-white rounded-xl p-5 border transition relative ${
                addr.isDefaultShipping ? "border-emerald-600 shadow-sm" : "border-stone-200"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-stone-900">{addr.fullName}</span>
                    {addr.isDefaultShipping && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-500 mt-0.5">{addr.phone}</p>
                </div>

                <button
                  onClick={() => handleDeleteAddress(addr.id)}
                  className="text-stone-400 hover:text-rose-600 transition p-1"
                  title="Delete address"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-3 text-xs text-stone-600 space-y-0.5">
                <p>{addr.street}</p>
                {addr.landmark && <p className="text-stone-500">Near: {addr.landmark}</p>}
                <p>
                  {addr.city}, {addr.state} - {addr.postalCode}
                </p>
                <p>{addr.country}</p>
              </div>

              {!addr.isDefaultShipping && (
                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-end">
                  <button
                    onClick={() => handleSetDefault(addr.id)}
                    className="text-xs font-medium text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" /> Set as Default
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Address Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-serif font-bold text-stone-900 mb-1">Add Delivery Address</h2>
            <p className="text-xs text-stone-500 mb-4">Ensure accuracy for smooth courier dispatch</p>

            {error && (
              <div className="mb-4 p-3 bg-rose-50 text-rose-700 text-xs rounded-lg border border-rose-200">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateAddress} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Full Recipient Name *</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="e.g. Priya Sharma"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Contact Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. 9876543210"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Street Address, Flat / House No. *</label>
                <input
                  type="text"
                  required
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  placeholder="Flat 402, Green Valley Apts, 12th Cross Road"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">Landmark (Optional)</label>
                <input
                  type="text"
                  value={formData.landmark}
                  onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                  placeholder="Behind Apollo Pharmacy"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Bengaluru"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="Karnataka"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Postal Code (PIN) *</label>
                  <input
                    type="text"
                    required
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    placeholder="560001"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Country</label>
                  <input
                    type="text"
                    disabled
                    value={formData.country}
                    className="w-full px-3 py-2 border border-stone-200 bg-stone-50 rounded-lg text-xs text-stone-500"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isDefaultShipping}
                    onChange={(e) => setFormData({ ...formData, isDefaultShipping: e.target.checked })}
                    className="rounded text-emerald-700 focus:ring-emerald-700"
                  />
                  <span className="text-stone-700 font-medium">Set as default shipping address</span>
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-stone-300 rounded-lg text-stone-600 hover:bg-stone-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-stone-900 hover:bg-emerald-800 text-white font-medium rounded-lg transition disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
