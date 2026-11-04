"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import {
  Ruler,
  ShoppingBag,
  Check,
  ShieldCheck,
  Truck,
  RotateCcw,
  AlertCircle,
  X,
} from "lucide-react";

interface Variant {
  id: string;
  sku: string;
  size: string;
  colorName: string;
  colorHex: string;
  price: number;
  stock: number;
}

interface ProductDetailProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string;
    details: string | null;
    sizeChart: string | null;
    basePrice: number;
    salePrice: number | null;
    category: {
      id: string;
      name: string;
      slug: string;
    };
    variants: Variant[];
  };
}

export function ProductDetailClient({ product }: ProductDetailProps) {
  const { addItem } = useCart();

  // Extract distinct colors and sizes
  const uniqueColors = useMemo(() => {
    const map = new Map<string, string>();
    for (const v of product.variants) {
      if (!map.has(v.colorName)) {
        map.set(v.colorName, v.colorHex);
      }
    }
    return Array.from(map.entries()).map(([name, hex]) => ({ name, hex }));
  }, [product.variants]);

  const uniqueSizes = useMemo(() => {
    const set = new Set<string>();
    for (const v of product.variants) {
      set.add(v.size);
    }
    return Array.from(set);
  }, [product.variants]);

  // Initial selection
  const [selectedColor, setSelectedColor] = useState<string>(
    uniqueColors[0]?.name ?? ""
  );
  const [selectedSize, setSelectedSize] = useState<string>(
    uniqueSizes[0] ?? ""
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [showSizeChart, setShowSizeChart] = useState<boolean>(false);
  const [addedAnimation, setAddedAnimation] = useState<boolean>(false);

  // Active Variant lookup
  const activeVariant = useMemo(() => {
    return product.variants.find(
      (v) => v.colorName === selectedColor && v.size === selectedSize
    );
  }, [product.variants, selectedColor, selectedSize]);

  const isOutOfStock = !activeVariant || activeVariant.stock <= 0;
  const currentPrice = activeVariant ? activeVariant.price : product.salePrice ?? product.basePrice;

  const handleAddToCart = () => {
    if (!activeVariant || isOutOfStock) return;

    addItem({
      variantId: activeVariant.id,
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      sku: activeVariant.sku,
      size: activeVariant.size,
      colorName: activeVariant.colorName,
      colorHex: activeVariant.colorHex,
      price: activeVariant.price,
      quantity,
      maxStock: activeVariant.stock,
    });

    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-xs text-slate-500 mb-8">
        <Link href="/" className="hover:text-emerald-700">Home</Link>
        <span>/</span>
        <Link href={`/category/${product.category.slug}`} className="hover:text-emerald-700">
          {product.category.name}
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-semibold truncate">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
        {/* Left: Product Media Gallery Preview */}
        <div className="space-y-4">
          <div className="aspect-square bg-slate-100 rounded-2xl flex flex-col items-center justify-center p-8 text-center border border-slate-200 shadow-xs relative overflow-hidden">
            <div className="w-24 h-24 rounded-full bg-white shadow-sm flex items-center justify-center text-emerald-800 font-black text-2xl mb-4">
              MV
            </div>
            <span className="text-sm uppercase tracking-wider font-bold text-slate-400 mb-2">
              MorningVeg Apparel
            </span>
            <h2 className="text-xl font-bold text-slate-800 max-w-sm">
              {product.name}
            </h2>
            <p className="text-xs text-slate-400 mt-2">
              Color: {selectedColor} • Size: {selectedSize}
            </p>

            {product.salePrice && (
              <span className="absolute top-5 left-5 bg-red-600 text-white font-bold text-xs px-2.5 py-1 rounded-full shadow-sm">
                Special Offer
              </span>
            )}
          </div>
        </div>

        {/* Right: Product Purchase Configurator */}
        <div className="space-y-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded">
              {product.category.name}
            </span>
            <h1 className="mt-3 text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
              {product.name}
            </h1>
            <p className="mt-2 text-xs text-slate-400">
              SKU: {activeVariant?.sku ?? "Select variant"}
            </p>

            {/* Price Display */}
            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl font-black text-slate-900">
                ₹{currentPrice}
              </span>
              {product.salePrice && product.salePrice < product.basePrice && (
                <>
                  <span className="text-base text-slate-400 line-through">
                    ₹{product.basePrice}
                  </span>
                  <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                    Save ₹{product.basePrice - product.salePrice}
                  </span>
                </>
              )}
              <span className="text-xs text-slate-500 ml-1">Inclusive of all taxes</span>
            </div>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed">
            {product.description}
          </p>

          <div className="border-t border-slate-200 pt-6 space-y-6">
            {/* 1. Color Selector */}
            <div>
              <div className="flex justify-between text-sm mb-3">
                <span className="font-bold text-slate-900">Select Color</span>
                <span className="text-slate-500 font-medium">{selectedColor}</span>
              </div>
              <div className="flex flex-wrap gap-3">
                {uniqueColors.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setSelectedColor(c.name)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition ${
                      selectedColor === c.name
                        ? "border-emerald-700 bg-emerald-50/50 ring-2 ring-emerald-700/20"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <span
                      className="w-4 h-4 rounded-full border border-slate-300 shrink-0"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span className="text-xs font-medium text-slate-800">{c.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Size Selector + Size Chart Modal Trigger */}
            <div>
              <div className="flex justify-between items-center text-sm mb-3">
                <span className="font-bold text-slate-900">Select Size</span>
                <button
                  type="button"
                  onClick={() => setShowSizeChart(true)}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 transition"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  View Size Guide
                </button>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {uniqueSizes.map((s) => {
                  const variantForSize = product.variants.find(
                    (v) => v.colorName === selectedColor && v.size === s
                  );
                  const isAvailable = variantForSize && variantForSize.stock > 0;
                  const isSelected = selectedSize === s;

                  return (
                    <button
                      key={s}
                      type="button"
                      disabled={!isAvailable}
                      onClick={() => setSelectedSize(s)}
                      className={`py-3 text-xs font-bold rounded-xl border transition text-center ${
                        isSelected
                          ? "border-emerald-700 bg-emerald-700 text-white shadow-sm"
                          : isAvailable
                          ? "border-slate-200 bg-white text-slate-800 hover:border-slate-400"
                          : "border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed line-through"
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>

              {/* Stock Notice */}
              <div className="mt-3">
                {activeVariant ? (
                  activeVariant.stock > 0 ? (
                    <p className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      In Stock ({activeVariant.stock} units available)
                    </p>
                  ) : (
                    <p className="text-xs text-red-600 font-semibold flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Currently Out of Stock for this size &amp; color.
                    </p>
                  )
                ) : (
                  <p className="text-xs text-slate-400">Variant combination unavailable</p>
                )}
              </div>
            </div>

            {/* 3. Quantity & Add to Cart */}
            <div className="flex gap-4 items-center">
              <div className="flex items-center border border-slate-300 rounded-xl bg-slate-50">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3.5 py-3 text-slate-600 hover:text-slate-900 font-bold"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="px-3 text-sm font-bold text-slate-800">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min((activeVariant?.stock ?? 1), quantity + 1))}
                  disabled={quantity >= (activeVariant?.stock ?? 1)}
                  className="px-3.5 py-3 text-slate-600 hover:text-slate-900 font-bold disabled:opacity-30"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                className={`flex-1 py-4 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition cursor-pointer ${
                  addedAnimation
                    ? "bg-emerald-800 text-white"
                    : isOutOfStock
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                    : "bg-emerald-700 hover:bg-emerald-800 text-white"
                }`}
              >
                {addedAnimation ? (
                  <>
                    <Check className="w-5 h-5" />
                    Added to Bag!
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    {isOutOfStock ? "Out of Stock" : `Add to Bag • ₹${currentPrice * quantity}`}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Assurances Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-200">
            <div className="flex items-center gap-2.5 text-xs text-slate-600">
              <Truck className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Free Delivery across India on ₹999+</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-600">
              <RotateCcw className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>7-Day Easy Size Exchange</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-600">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>100% Genuine Sustainable Cotton</span>
            </div>
          </div>

          {/* Fabric & Product Details */}
          {product.details && (
            <div className="pt-6 border-t border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 mb-2">Fabric &amp; Care Details</h3>
              <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                {product.details}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Size Chart Modal */}
      {showSizeChart && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
            onClick={() => setShowSizeChart(false)}
          />
          <div className="relative bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl z-10 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Ruler className="w-5 h-5 text-emerald-700" />
                <h3 className="font-bold text-slate-900 text-lg">Size &amp; Measurement Guide</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSizeChart(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-600 space-y-3">
              <p className="font-medium text-slate-700">
                Measurements for: <span className="font-bold text-slate-900">{product.name}</span>
              </p>
              <div className="p-3 bg-slate-50 rounded-xl font-mono text-slate-800 text-xs border border-slate-200">
                {product.sizeChart || "Standard regular fit. Order your typical Indian/international size."}
              </div>
              <div className="space-y-1 text-slate-500">
                <p>• <strong>Chest:</strong> Measured across the fullest part of the chest, keeping the tape level.</p>
                <p>• <strong>Length:</strong> Measured from the highest shoulder point to the bottom hem.</p>
                <p>• Need a tailored fit? If between sizes, we recommend sizing up for a relaxed drape.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowSizeChart(false)}
              className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition"
            >
              Close Size Guide
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
