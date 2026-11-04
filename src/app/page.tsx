import { checkDatabaseHealth } from "@/lib/db";

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

  const sampleProducts = [
    {
      id: "prod-1",
      name: "Organic Cotton Classic Crew Tee",
      category: "T-Shirts",
      price: "₹799",
      sizes: ["S", "M", "L", "XL"],
      badge: "Best Seller",
    },
    {
      id: "prod-2",
      name: "Relaxed Fit Linen Overshirt",
      category: "Shirts",
      price: "₹1,499",
      sizes: ["M", "L", "XL"],
      badge: "New Arrival",
    },
    {
      id: "prod-3",
      name: "Everyday Chino Trousers",
      category: "Bottoms",
      price: "₹1,899",
      sizes: ["30", "32", "34", "36"],
      badge: "Essential",
    },
    {
      id: "prod-4",
      name: "Merino Wool Blend Pullover",
      category: "Knitwear",
      price: "₹2,299",
      sizes: ["S", "M", "L"],
      badge: "Limited Edition",
    },
  ];

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-emerald-50/60 to-transparent pt-16 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 mb-6">
          <span className={`w-2 h-2 rounded-full ${dbHealthy ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
          Prisma + Neon Adapter: {dbHealthy ? "Active & Synced" : "Pending Sync"}
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
            Explore Catalog
          </a>
          <a
            href="/api/health"
            className="px-6 py-3 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium transition"
          >
            Inspect Health API
          </a>
        </div>
      </section>

      {/* Database Integration Verification Banner */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">ORM &amp; Database Backend</p>
            <p className="text-sm font-semibold text-slate-800">{dbStatus}</p>
            {lastTimestamp && <p className="text-xs text-slate-500">Last Synced Record: {lastTimestamp}</p>}
          </div>
          <div className="shrink-0 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              ORM: Prisma 7.10
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
              Adapter: @prisma/adapter-neon
            </span>
          </div>
        </div>
      </section>

      {/* Featured Apparel Products */}
      <section id="featured" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Featured Apparel</h2>
            <p className="text-sm text-slate-500">High-rotation daily essentials</p>
          </div>
          <span className="text-xs font-semibold text-emerald-700">All India Delivery</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {sampleProducts.map((p) => (
            <div
              key={p.id}
              className="group border border-slate-200 rounded-xl bg-white p-5 hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="aspect-square bg-slate-100 rounded-lg mb-4 flex items-center justify-center text-slate-400 text-sm font-medium">
                  [Product Image: {p.name}]
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span>{p.category}</span>
                  <span className="bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded">{p.badge}</span>
                </div>
                <h3 className="font-semibold text-slate-900 text-base group-hover:text-emerald-700 transition">
                  {p.name}
                </h3>
                <div className="mt-2 flex flex-wrap gap-1">
                  {p.sizes.map((s) => (
                    <span key={s} className="text-xs border border-slate-200 px-1.5 py-0.5 rounded text-slate-600">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-lg font-bold text-slate-900">{p.price}</span>
                <button
                  type="button"
                  className="px-3 py-1.5 bg-slate-900 hover:bg-emerald-700 text-white rounded text-xs font-medium transition cursor-pointer"
                >
                  View Variant
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
