import { Metadata } from "next";
import Link from "next/link";
import { searchProducts } from "@/lib/catalog";
import { ProductCard } from "@/components/ProductCard";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `Search results for "${q}" | MorningVeg Apparel` : "Search Apparel | MorningVeg",
  };
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = q ?? "";
  const products = await searchProducts(query);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Search Header */}
      <div>
        <nav className="flex items-center space-x-2 text-xs text-slate-500 mb-4">
          <Link href="/" className="hover:text-emerald-700">Home</Link>
          <span>/</span>
          <span className="text-slate-900 font-semibold">Search</span>
        </nav>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          {query ? `Search results for "${query}"` : "Search our apparel catalog"}
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          {products.length} product{products.length === 1 ? "" : "s"} found
        </p>
      </div>

      {products.length === 0 ? (
        <div className="py-20 text-center space-y-4 bg-white rounded-2xl border border-slate-200 p-8">
          <p className="text-lg font-bold text-slate-800">No products found matching &ldquo;{query}&rdquo;</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try searching for terms like &ldquo;linen&rdquo;, &ldquo;tee&rdquo;, &ldquo;chinos&rdquo;, or &ldquo;sweatshirt&rdquo;.
          </p>
          <div className="pt-2 flex justify-center gap-2 flex-wrap">
            <Link href="/category/t-shirts" className="text-xs px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-medium">T-Shirts</Link>
            <Link href="/category/shirts" className="text-xs px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-medium">Linen Shirts</Link>
            <Link href="/category/bottoms" className="text-xs px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-medium">Chinos</Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
