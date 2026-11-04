import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategoryWithProducts } from "@/lib/catalog";
import { ProductCard } from "@/components/ProductCard";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ size?: string; sort?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getCategoryWithProducts(slug);

  if (!data) {
    return { title: "Category Not Found | MorningVeg Apparel" };
  }

  return {
    title: `${data.category.name} Collection | MorningVeg Apparel`,
    description: data.category.description ?? `Browse ${data.category.name} apparel at MorningVeg.`,
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const filters = await searchParams;

  const data = await getCategoryWithProducts(slug, {
    size: filters.size,
    sort: filters.sort,
  });

  if (!data) {
    notFound();
  }

  const { category, products } = data;
  const sizeOptions = ["S", "M", "L", "XL", "30", "32", "34", "36"];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-emerald-700">Home</Link>
        <span>/</span>
        <span className="text-slate-900 font-semibold">{category.name}</span>
      </nav>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 to-slate-900 rounded-2xl p-8 sm:p-12 text-white">
        <span className="text-xs uppercase font-bold tracking-widest text-emerald-400">
          Collection
        </span>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight mt-2">
          {category.name}
        </h1>
        {category.description && (
          <p className="mt-3 text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            {category.description}
          </p>
        )}
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-200 bg-white">
        {/* Size Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-bold text-slate-400 mr-1">Size:</span>
          <Link
            href={`/category/${slug}${filters.sort ? `?sort=${filters.sort}` : ""}`}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              !filters.size
                ? "bg-emerald-700 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            All
          </Link>
          {sizeOptions.map((s) => (
            <Link
              key={s}
              href={`/category/${slug}?size=${s}${filters.sort ? `&sort=${filters.sort}` : ""}`}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                filters.size === s
                  ? "bg-emerald-700 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {s}
            </Link>
          ))}
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium">Sort by:</span>
          <Link
            href={`/category/${slug}?${filters.size ? `size=${filters.size}&` : ""}sort=price-low`}
            className={`px-2.5 py-1 rounded-lg transition ${
              filters.sort === "price-low"
                ? "bg-slate-900 text-white font-bold"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Price: Low to High
          </Link>
          <Link
            href={`/category/${slug}?${filters.size ? `size=${filters.size}&` : ""}sort=price-high`}
            className={`px-2.5 py-1 rounded-lg transition ${
              filters.sort === "price-high"
                ? "bg-slate-900 text-white font-bold"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            Price: High to Low
          </Link>
        </div>
      </div>

      {/* Product Grid */}
      {products.length === 0 ? (
        <div className="py-20 text-center space-y-3 bg-white rounded-2xl border border-slate-200">
          <p className="text-lg font-bold text-slate-800">No products found</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your size filters to see available stock in this category.
          </p>
          <Link
            href={`/category/${slug}`}
            className="inline-block px-4 py-2 bg-emerald-700 text-white rounded-lg text-xs font-semibold hover:bg-emerald-800 transition"
          >
            Clear Filters
          </Link>
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
