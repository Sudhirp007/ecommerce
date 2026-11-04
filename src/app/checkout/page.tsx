"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { 
  ArrowLeft, 
  CheckCircle2, 
  CreditCard, 
  Lock, 
  MapPin, 
  QrCode, 
  ShieldAlert, 
  ShieldCheck, 
  ShoppingBag, 
  Smartphone, 
  Truck 
} from "lucide-react";

interface SavedAddress {
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
}

interface ValidatedItem {
  variantId: string;
  productName: string;
  sku: string;
  size: string;
  colorName: string;
  unitPrice: number;
  quantity: number;
  lineSubtotal: number;
  availableStock: number;
  isOutOfStock: boolean;
  stockSufficient: boolean;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCart();
  const { user } = useAuth();

  // Address state
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [useNewAddress, setUseNewAddress] = useState(false);

  const [addressForm, setAddressForm] = useState({
    fullName: "",
    phone: "",
    street: "",
    landmark: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
  });

  // Server calculation state
  const [isValidating, setIsValidating] = useState(true);
  const [serverCalc, setServerCalc] = useState<{
    valid: boolean;
    items: ValidatedItem[];
    subtotal: number;
    shippingFee: number;
    grandTotal: number;
    errors: string[];
  } | null>(null);

  // Payment selection
  const [paymentMethod, setPaymentMethod] = useState<"UPI_INTENT" | "UPI_QR" | "CARD" | "NETBANKING">("UPI_INTENT");
  const [orderNotes, setOrderNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Fetch saved addresses if logged in
  useEffect(() => {
    if (user) {
      fetch("/api/account/addresses")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.addresses?.length > 0) {
            setSavedAddresses(data.addresses);
            const defaultAddr = data.addresses.find((a: SavedAddress) => a.isDefaultShipping) || data.addresses[0];
            setSelectedAddressId(defaultAddr.id);
            setUseNewAddress(false);
          } else {
            setUseNewAddress(true);
            setAddressForm((prev) => ({
              ...prev,
              fullName: user.name || "",
              phone: user.phone || "",
            }));
          }
        })
        .catch((err) => console.error("Error loading addresses:", err));
    } else {
      setUseNewAddress(true);
    }
  }, [user]);

  // Recalculate cart on server (ZERO CLIENT TRUST)
  const validateCartOnServer = useCallback(async () => {
    if (items.length === 0) {
      setIsValidating(false);
      return;
    }

    try {
      setIsValidating(true);
      const res = await fetch("/api/cart/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setServerCalc(data.calculation);
      } else {
        setCheckoutError(data.error || "Failed to validate cart");
      }
    } catch {
      setCheckoutError("Network error validating cart");
    } finally {
      setIsValidating(false);
    }
  }, [items]);

  useEffect(() => {
    validateCartOnServer();
  }, [validateCartOnServer]);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError(null);

    // Determine chosen address
    let activeAddress = null;
    if (!useNewAddress && selectedAddressId) {
      const found = savedAddresses.find((a) => a.id === selectedAddressId);
      if (found) {
        activeAddress = {
          fullName: found.fullName,
          phone: found.phone,
          street: found.street,
          landmark: found.landmark || undefined,
          city: found.city,
          state: found.state,
          postalCode: found.postalCode,
          country: found.country,
        };
      }
    } else {
      if (!addressForm.fullName || !addressForm.phone || !addressForm.street || !addressForm.city || !addressForm.state || !addressForm.postalCode) {
        setCheckoutError("Please fill in all mandatory address fields marked with *");
        return;
      }
      activeAddress = addressForm;
    }

    if (!activeAddress) {
      setCheckoutError("Please specify a valid delivery shipping address.");
      return;
    }

    if (!serverCalc?.valid) {
      setCheckoutError("Please resolve cart errors before proceeding to order payment.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
          shippingAddress: activeAddress,
          paymentMethod,
          notes: orderNotes || undefined,
        }),
      });

      const data = await res.json();
      setIsSubmitting(false);

      if (res.ok && data.success) {
        // Clear client shopping bag
        clearCart();
        // Redirect to Order Success Confirmation
        router.push(`/order-success/${data.order.orderNumber}`);
      } else {
        setCheckoutError(data.error || "Order placement failed.");
      }
    } catch {
      setIsSubmitting(false);
      setCheckoutError("Network error while creating order.");
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400 mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-serif font-bold text-stone-900">Your shopping bag is empty</h1>
        <p className="text-sm text-stone-500 mt-2 mb-6">
          Add some everyday apparel pieces from our collections to proceed with checkout.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-stone-900 hover:bg-emerald-800 text-white text-xs font-semibold px-6 py-3 rounded-lg transition"
        >
          <ArrowLeft className="w-4 h-4" /> Explore Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-500 hover:text-stone-800 transition mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Continue Shopping
        </Link>
        <h1 className="text-3xl font-serif font-bold text-stone-900">Express Checkout</h1>
        <p className="text-xs text-stone-500 mt-1">Review your apparel items, delivery address, and payment method</p>
      </div>

      {checkoutError && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-sm text-rose-700">
          <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5 text-rose-500" />
          <div>
            <p className="font-semibold">Unable to complete checkout</p>
            <p className="text-xs mt-0.5">{checkoutError}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Delivery Address & Payment Method */}
        <div className="lg:col-span-7 space-y-6">
          {/* Step 1: Delivery Address */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-emerald-800 text-white flex items-center justify-center text-xs font-bold">
                  1
                </div>
                <h2 className="text-base font-serif font-bold text-stone-900">Delivery Destination</h2>
              </div>
              <MapPin className="w-4 h-4 text-emerald-800" />
            </div>

            {/* Saved Addresses for Logged-In User */}
            {user && savedAddresses.length > 0 && (
              <div className="space-y-3 mb-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">Choose Delivery Address:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {savedAddresses.map((addr) => {
                    const isSelected = !useNewAddress && selectedAddressId === addr.id;
                    return (
                      <div
                        key={addr.id}
                        onClick={() => {
                          setSelectedAddressId(addr.id);
                          setUseNewAddress(false);
                        }}
                        className={`p-3.5 rounded-xl border cursor-pointer transition text-xs ${
                          isSelected
                            ? "border-emerald-700 bg-emerald-50/50 ring-1 ring-emerald-700"
                            : "border-stone-200 hover:border-stone-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-stone-900">{addr.fullName}</span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-700" />}
                        </div>
                        <p className="text-stone-500 text-[11px] mt-0.5">{addr.phone}</p>
                        <p className="text-stone-600 mt-1 line-clamp-2">
                          {addr.street}, {addr.city} - {addr.postalCode}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => setUseNewAddress(!useNewAddress)}
                  className="text-xs font-semibold text-emerald-700 hover:underline pt-1 inline-block"
                >
                  {useNewAddress ? "← Select a saved address" : "+ Deliver to a new address"}
                </button>
              </div>
            )}

            {/* Address Form (if guest or new address selected) */}
            {useNewAddress && (
              <div className="space-y-3.5 pt-2 text-xs border-t border-stone-100">
                {!user && (
                  <div className="p-3 bg-stone-50 rounded-lg text-stone-600 text-xs flex items-center justify-between">
                    <span>Already have a MorningVeg account?</span>
                    <Link href="/login?redirect=/checkout" className="text-emerald-700 font-semibold hover:underline">
                      Sign in for saved addresses
                    </Link>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={addressForm.fullName}
                      onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                      placeholder="Rohit Sharma"
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-1 focus:ring-emerald-700"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={addressForm.phone}
                      onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                      placeholder="9876543210"
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-1 focus:ring-emerald-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">House / Flat / Street Address *</label>
                  <input
                    type="text"
                    required
                    value={addressForm.street}
                    onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                    placeholder="Flat 402, Green Glen Layout, Outer Ring Road"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-1 focus:ring-emerald-700"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Landmark (Optional)</label>
                  <input
                    type="text"
                    value={addressForm.landmark}
                    onChange={(e) => setAddressForm({ ...addressForm, landmark: e.target.value })}
                    placeholder="Near Bellandur Junction"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-1 focus:ring-emerald-700"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">City *</label>
                    <input
                      type="text"
                      required
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                      placeholder="Bengaluru"
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-1 focus:ring-emerald-700"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">State *</label>
                    <input
                      type="text"
                      required
                      value={addressForm.state}
                      onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                      placeholder="Karnataka"
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-1 focus:ring-emerald-700"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">PIN Code *</label>
                    <input
                      type="text"
                      required
                      value={addressForm.postalCode}
                      onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                      placeholder="560103"
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-1 focus:ring-emerald-700"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Payment Method */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-emerald-800 text-white flex items-center justify-center text-xs font-bold">
                  2
                </div>
                <h2 className="text-base font-serif font-bold text-stone-900">Payment Option</h2>
              </div>
              <ShieldCheck className="w-4 h-4 text-emerald-800" />
            </div>

            {/* Sandbox Alert */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl mb-4 text-xs text-amber-800 flex items-center gap-2.5">
              <Lock className="w-4 h-4 shrink-0 text-amber-600" />
              <span>
                <strong>Razorpay Test Sandbox Active:</strong> Test payments enabled. No real money will be charged.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <label
                className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition ${
                  paymentMethod === "UPI_INTENT"
                    ? "border-emerald-700 bg-emerald-50/50 ring-1 ring-emerald-700"
                    : "border-stone-200 hover:border-stone-300"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "UPI_INTENT"}
                  onChange={() => setPaymentMethod("UPI_INTENT")}
                  className="text-emerald-700 focus:ring-emerald-700"
                />
                <Smartphone className="w-4 h-4 text-emerald-700" />
                <div>
                  <p className="font-bold text-stone-900">UPI Apps (GPay, PhonePe, Paytm)</p>
                  <p className="text-[11px] text-stone-500">Instant app redirect checkout</p>
                </div>
              </label>

              <label
                className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition ${
                  paymentMethod === "UPI_QR"
                    ? "border-emerald-700 bg-emerald-50/50 ring-1 ring-emerald-700"
                    : "border-stone-200 hover:border-stone-300"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "UPI_QR"}
                  onChange={() => setPaymentMethod("UPI_QR")}
                  className="text-emerald-700 focus:ring-emerald-700"
                />
                <QrCode className="w-4 h-4 text-emerald-700" />
                <div>
                  <p className="font-bold text-stone-900">Dynamic UPI QR Code</p>
                  <p className="text-[11px] text-stone-500">Scan &amp; pay via any banking app</p>
                </div>
              </label>

              <label
                className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition ${
                  paymentMethod === "CARD"}
                    ? "border-emerald-700 bg-emerald-50/50 ring-1 ring-emerald-700"
                    : "border-stone-200 hover:border-stone-300"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "CARD"}
                  onChange={() => setPaymentMethod("CARD")}
                  className="text-emerald-700 focus:ring-emerald-700"
                />
                <CreditCard className="w-4 h-4 text-emerald-700" />
                <div>
                  <p className="font-bold text-stone-900">Credit / Debit Card</p>
                  <p className="text-[11px] text-stone-500">Visa, MasterCard, RuPay</p>
                </div>
              </label>

              <label
                className={`p-3.5 rounded-xl border flex items-center gap-3 cursor-pointer transition ${
                  paymentMethod === "NETBANKING"
                    ? "border-emerald-700 bg-emerald-50/50 ring-1 ring-emerald-700"
                    : "border-stone-200 hover:border-stone-300"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "NETBANKING"}
                  onChange={() => setPaymentMethod("NETBANKING")}
                  className="text-emerald-700 focus:ring-emerald-700"
                />
                <Truck className="w-4 h-4 text-emerald-700" />
                <div>
                  <p className="font-bold text-stone-900">NetBanking / Other</p>
                  <p className="text-[11px] text-stone-500">50+ major Indian banks</p>
                </div>
              </label>
            </div>

            <div className="mt-4 pt-3 border-t border-stone-100">
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Order Notes / Delivery Instructions (Optional)
              </label>
              <textarea
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="Leave with security or call upon arrival..."
                rows={2}
                className="w-full text-xs p-2.5 border border-stone-300 rounded-lg focus:ring-1 focus:ring-emerald-700"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Placement */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm sticky top-24 space-y-5">
            <h2 className="text-base font-serif font-bold text-stone-900">Order Summary</h2>

            {isValidating ? (
              <div className="py-8 text-center text-xs text-stone-500">
                <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-stone-300 border-t-emerald-700 mb-2"></div>
                <p>Verifying live prices and stock with server...</p>
              </div>
            ) : serverCalc ? (
              <div className="space-y-4">
                {/* Items Breakdown */}
                <div className="divide-y divide-stone-100 max-h-60 overflow-y-auto pr-1">
                  {serverCalc.items.map((item) => (
                    <div key={item.variantId} className="py-2.5 flex items-start justify-between text-xs gap-2">
                      <div>
                        <p className="font-semibold text-stone-900">{item.productName}</p>
                        <p className="text-stone-500 text-[11px]">
                          Size: {item.size} • Color: {item.colorName} • Qty: {item.quantity}
                        </p>
                        {!item.stockSufficient && (
                          <span className="text-[10px] text-rose-600 font-bold">
                            {item.isOutOfStock ? "Out of stock" : `Only ${item.availableStock} left`}
                          </span>
                        )}
                      </div>
                      <div className="text-right font-medium text-stone-900">
                        ₹{item.lineSubtotal}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Calculation Totals */}
                <div className="border-t border-stone-200 pt-3 space-y-2 text-xs">
                  <div className="flex justify-between text-stone-600">
                    <span>Subtotal</span>
                    <span className="font-medium text-stone-900">₹{serverCalc.subtotal}</span>
                  </div>

                  <div className="flex justify-between text-stone-600">
                    <span>Shipping &amp; Delivery</span>
                    <span>
                      {serverCalc.shippingFee === 0 ? (
                        <span className="text-emerald-700 font-bold uppercase tracking-wider text-[11px]">
                          FREE
                        </span>
                      ) : (
                        <span className="font-medium text-stone-900">₹{serverCalc.shippingFee}</span>
                      )}
                    </span>
                  </div>

                  {serverCalc.shippingFee > 0 && (
                    <p className="text-[10px] text-emerald-800 bg-emerald-50 p-2 rounded border border-emerald-100">
                      Add ₹{999 - serverCalc.subtotal} more to qualify for FREE express shipping!
                    </p>
                  )}

                  <div className="border-t border-stone-200 pt-3 flex justify-between items-baseline">
                    <span className="text-sm font-bold text-stone-900">Grand Total</span>
                    <span className="text-xl font-serif font-black text-emerald-900">
                      ₹{serverCalc.grandTotal}
                    </span>
                  </div>
                </div>

                {/* Submit Order Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || !serverCalc.valid}
                  className="w-full bg-stone-900 hover:bg-emerald-800 text-white font-semibold py-3.5 rounded-xl text-sm transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? "Placing Order..." : `Place Order (₹${serverCalc.grandTotal})`}
                </button>

                <p className="text-[11px] text-stone-400 text-center flex items-center justify-center gap-1">
                  <Lock className="w-3 h-3" /> Secure 256-bit encrypted checkout
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </form>
    </div>
  );
}
