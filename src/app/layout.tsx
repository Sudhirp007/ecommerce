import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MorningVeg Apparel | Quality Everyday Clothing",
  description: "Modern, sustainable, high-comfort clothing and apparel store.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased">
        <header className="border-b border-slate-200 bg-white/90 backdrop-blur sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl font-black tracking-tight text-emerald-700">MorningVeg</span>
              <span className="text-xs font-semibold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">Apparel</span>
            </div>
            <nav className="hidden md:flex space-x-8 text-sm font-medium text-slate-600">
              <a href="#categories" className="hover:text-emerald-700 transition">Categories</a>
              <a href="#featured" className="hover:text-emerald-700 transition">Featured</a>
              <a href="#about" className="hover:text-emerald-700 transition">About</a>
              <a href="/api/health" className="text-xs bg-slate-100 px-2.5 py-1 rounded-full text-slate-700 border border-slate-200 hover:border-emerald-500 transition">Live System Status</a>
            </nav>
          </div>
        </header>

        <main className="flex-1">
          {children}
        </main>

        <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 space-y-2">
            <p>&copy; {new Date().getFullYear()} MorningVeg Apparel. All rights reserved.</p>
            <p className="text-slate-400">Deployed on Neon Lakebase PostgreSQL & Next.js</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
