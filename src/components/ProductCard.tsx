import React from "react";
import Link from "next/link";
import { ProductSummary } from "@/lib/catalog";

export function ProductCard({ product }: { product: ProductSummary }) {
  const discountAmount = product.salePrice ? product.basePrice - product.salePrice : 0;

  return (
    <div className="group border border-slate-200 rounded-2xl bg-white p-5 hover:shadow-xl hover:border-emerald-300 transition-all duration-300 flex flex-col justify-between">
      <div>
        {/* Thumbnail Preview Area */}
        <Link href={`/product/${product.slug}`} className="block relative aspect-square bg-slate-100 rounded-xl mb-4 overflow-hidden flex flex-col items-center justify-center p-4 text-center">
          <div className="w-12 h-12 rounded-full bg-white/80 shadow-xs flex items-center justify-center text-emerald-800 font-black text-sm mb-2 group-hover:scale-110 transition duration-300">
            MV
          </div>
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">
            {product.category.name}
          </span>
          <span className="text-sm font-bold text-slate-800 line-clamp-1">
            {product.name}
          </span>

          {discountAmount > 0 && (
            <span className="absolute top-3 left-3 bg-red-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-full shadow-xs">
              Save ₹{discountAmount}
            </span>
          )}

          {product.totalStock <= 15 && product.totalStock > 0 && (
            <span className="absolute bottom-3 left-3 bg-amber-100 text-amber-800 text-[10px] font-semibold px-2 py-0.5 rounded-full">
              Only {product.totalStock} left
            </span>
          )}
        </Link>

        {/* Category & Stock Metadata */}
        <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
          <Link
            href={`/category/${product.category.slug}`}
            className="font-medium text-emerald-800 hover:text-emerald-950 transition"
          >
            {product.category.name}
          </Link>
          <span className="text-[11px] text-slate-400">
            {product.totalStock > 0 ? "In Stock" : "Out of Stock"}
          </span>
        </div>

        {/* Product Title */}
        <Link
          href={`/product/${product.slug}`}
          className="font-bold text-slate-900 text-base group-hover:text-emerald-700 transition line-clamp-1"
        >
          {product.name}
        </Link>

        {/* Color Swatches */}
        {product.availableColors.length > 0 && (
          <div className="mt-3 flex items-center gap-1.5">
            {product.availableColors.map((c) => (
              <span
                key={c.name}
                title={c.name}
                className="w-3.5 h-3.5 rounded-full border border-slate-300 inline-block shadow-2xs"
                style={{ backgroundColor: c.hex }}
              />
            ))}
            <span className="text-[10px] text-slate-400 ml-1">
              {product.availableColors.length} color{product.availableColors.length === 1 ? "" : "s"}
            </span>
          </div>
        )}

        {/* Available Sizes */}
        {product.availableSizes.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1">
            {product.availableSizes.map((s) => (
              <span
                key={s}
                className="text-[10px] border border-slate-200 px-1.5 py-0.5 rounded text-slate-600 font-medium"
              >
                {s}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Pricing & Call-to-Action */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-black text-slate-900">
            ₹{product.salePrice ?? product.basePrice}
          </span>
          {product.salePrice && (
            <span className="text-xs text-slate-400 line-through">
              ₹{product.basePrice}
            </span>
          )}
        </div>

        <Link
          href={`/product/${product.slug}`}
          className="px-3.5 py-1.5 bg-slate-900 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition"
        >
          View Options
        </Link>
      </div>
    </div>
  );
}
