"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";

export function CartDrawer() {
  const router = useRouter();
  const {
    items,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeItem,
    subtotal,
    totalItems,
    freeShippingThreshold,
    freeShippingRemaining,
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-700" />
              <h2 className="font-bold text-slate-900 text-lg">Your Cart</h2>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                {totalItems} item{totalItems === 1 ? "" : "s"}
              </span>
            </div>
            <button
              type="button"
              onClick={closeCart}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Bar */}
          <div className="bg-emerald-50/60 p-4 border-b border-emerald-100">
            {freeShippingRemaining > 0 ? (
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-emerald-900">
                  Add <span className="font-bold">₹{freeShippingRemaining}</span> more for{" "}
                  <span className="font-bold text-emerald-700">Free Express Delivery</span> across India!
                </p>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-600 h-1.5 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(100, ((freeShippingThreshold - freeShippingRemaining) / freeShippingThreshold) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            ) : (
              <p className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                🎉 Congratulations! You have unlocked Free Delivery!
              </p>
            )}
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-5 divide-y divide-slate-100 space-y-4">
            {items.length === 0 ? (
              <div className="py-16 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-base">Your cart is empty</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                    Explore our sustainable apparel collections and find everyday essentials.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeCart}
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold transition"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.variantId} className="pt-4 first:pt-0 flex gap-4">
                  {/* Thumbnail */}
                  <div className="w-20 h-20 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 text-xs shrink-0 p-1 text-center font-medium">
                    {item.productName.split(" ")[0]}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <Link
                        href={`/product/${item.productSlug}`}
                        onClick={closeCart}
                        className="font-semibold text-slate-900 text-sm hover:text-emerald-700 transition truncate"
                      >
                        {item.productName}
                      </Link>
                      <button
                        type="button"
                        onClick={() => removeItem(item.variantId)}
                        className="text-slate-400 hover:text-red-500 p-1 transition"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                      <span>Size: <strong className="text-slate-700">{item.size}</strong></span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        Color:
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-slate-300 inline-block"
                          style={{ backgroundColor: item.colorHex }}
                        />
                        <strong className="text-slate-700">{item.colorName}</strong>
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      {/* Quantity Controller */}
                      <div className="inline-flex items-center border border-slate-200 rounded-lg bg-slate-50">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 transition"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-semibold text-slate-800">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                          disabled={item.quantity >= item.maxStock}
                          className="p-1.5 text-slate-600 hover:text-slate-900 transition disabled:opacity-30"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Price */}
                      <span className="font-bold text-slate-900 text-sm">
                        ₹{item.price * item.quantity}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Call-to-Action */}
          {items.length > 0 && (
            <div className="p-5 border-t border-slate-200 bg-slate-50/50 space-y-4">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-800">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Shipping</span>
                  <span>{freeShippingRemaining === 0 ? "FREE" : "₹99"}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between font-black text-slate-900 text-base">
                  <span>Estimated Total</span>
                  <span>₹{subtotal + (freeShippingRemaining === 0 ? 0 : 99)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  closeCart();
                  router.push("/checkout");
                }}
                className="w-full py-3.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
              >
                Proceed to Checkout
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-center text-[10px] text-slate-400">
                Taxes calculated at checkout • Secure 256-bit SSL encrypted checkout
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
