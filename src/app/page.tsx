import { checkDatabaseHealth } from "@/lib/db";
import { getCategoriesWithCounts, getFeaturedProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  let dbStatus = "Connecting...";
  let dbHealthy = false;
  let recordCount = 0;
  let lastTimestamp = "";

  try {
    const health = await checkDatabaseHealth();
    dbHealthy = health.status === "healthy";
    recordCount = health.recordCount;
    dbStatus = `Prisma ORM connected to Neon PostgreSQL (${recordCount} health record${recordCount === 1 ? "" : "s"} logged)`;
    if (health.lastRecord) {
      lastTimestamp = new Date(health.lastRecord.timestamp).toLocaleString();
    }
  } catch (err) {
    dbHealthy = false;
    dbStatus = err instanceof Error ? err.message : "Failed to connect to Neon database";
  }

  // Query live seeded apparel catalog from Neon PostgreSQL
  const [categories, featuredProducts] = await Promise.all([
    getCategoriesWithCounts().catch(() => []),
    getFeaturedProducts().catch(() => []),
  ]);

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-emerald-50/60 to-transparent pt-16 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 mb-6">
          <span className={`w-2 h-2 rounded-full ${dbHealthy ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
          Prisma + Neon PostgreSQL: {dbHealthy ? "Live & Synced" : "Pending Sync"}
        </div>
        <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
          Thoughtfully Designed Apparel for Everyday Living.
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto">
          MorningVeg Apparel brings sustainable, premium-grade fabrics and tailored fits directly to your wardrobe.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <a
            href="#featured"
            className="px-6 py-3 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-medium shadow-sm transition"
          >
            Explore Catalog ({featuredProducts.length} Items)
          </a>
          <a
            href="/api/catalog/products"
            className="px-6 py-3 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium transition"
          >
            View Catalog JSON
          </a>
        </div>
      </section>

      {/* Database Integration Verification Banner */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">ORM &amp; Database Telemetry</p>
            <p className="text-sm font-semibold text-slate-800">{dbStatus}</p>
            <p className="text-xs text-slate-500">
              Live Database Content: {categories.length} Categories, {featuredProducts.length} Featured Products
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              Prisma 7.10
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
              Neon PostgreSQL
            </span>
          </div>
        </div>
      </section>

      {/* Category Navigation Pills */}
      <section id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900">Shop by Category</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="px-4 py-2 rounded-lg border border-slate-200 bg-white hover:border-emerald-600 transition flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <span className="text-sm font-medium text-slate-800">{cat.name}</span>
              <span className="text-xs font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full">
                {cat.productCount}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Live Featured Apparel Products from Neon PostgreSQL */}
      <section id="featured" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Featured Apparel</h2>
            <p className="text-sm text-slate-500">Live products retrieved via Prisma ORM from Neon Lakebase</p>
          </div>
          <span className="text-xs font-semibold text-emerald-700">All India Delivery</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProducts.map((p) => (
            <div
              key={p.id}
              className="group border border-slate-200 rounded-xl bg-white p-6 hover:shadow-lg transition flex flex-col justify-between"
            >
              <div>
                <div className="aspect-square bg-slate-100 rounded-lg mb-4 flex flex-col items-center justify-center text-slate-400 p-4 text-center">
                  <span className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-1">MorningVeg Apparel</span>
                  <span className="text-sm font-semibold text-slate-700">{p.name}</span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span className="font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                    {p.category.name}
                  </span>
                  <span className="text-slate-400">Stock: {p.totalStock} units</span>
                </div>

                <h3 className="font-bold text-slate-900 text-lg group-hover:text-emerald-700 transition">
                  {p.name}
                </h3>
                <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                  {p.description}
                </p>

                {/* Color swatches */}
                {p.availableColors.length > 0 && (
                  <div className="mt-4 flex items-center gap-1.5">
                    <span className="text-xs text-slate-400 mr-1">Colors:</span>
                    {p.availableColors.map((c) => (
                      <span
                        key={c.name}
                        title={c.name}
                        className="w-4 h-4 rounded-full border border-slate-300 inline-block"
                        style={{ backgroundColor: c.hex }}
                      />
                    ))}
                  </div>
                )}

                {/* Available Sizes */}
                {p.availableSizes.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1 items-center">
                    <span className="text-xs text-slate-400 mr-1">Sizes:</span>
                    {p.availableSizes.map((s) => (
                      <span key={s} className="text-xs border border-slate-200 px-2 py-0.5 rounded text-slate-700 font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-black text-slate-900">
                    ₹{p.salePrice ?? p.basePrice}
                  </span>
                  {p.salePrice && (
                    <span className="text-xs text-slate-400 line-through">
                      ₹{p.basePrice}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  className="px-4 py-2 bg-slate-900 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
                >
                  Select Options
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
