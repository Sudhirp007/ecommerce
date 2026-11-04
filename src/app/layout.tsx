import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { Header } from "@/components/Header";
import { CartDrawer } from "@/components/CartDrawer";

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
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased selection:bg-emerald-100 selection:text-emerald-900">
        <AuthProvider>
          <CartProvider>
            {/* Global Header with Live Cart Badge & Search */}
            <Header />

            {/* Global Slide-Over Cart Drawer */}
            <CartDrawer />

            {/* Main Page Body */}
            <main className="flex-1">
              {children}
            </main>

          {/* Global Storefront Footer */}
          <footer className="border-t border-slate-200 bg-white py-12 text-xs text-slate-500">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-emerald-800">MorningVeg</span>
                  <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">Apparel</span>
                </div>
                <p className="text-slate-500 leading-relaxed">
                  Crafting refined, conscious everyday essentials designed for durability, ease of wear, and breathable comfort.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-3">Shop Collections</h4>
                <ul className="space-y-2">
                  <li><a href="/category/t-shirts" className="hover:text-emerald-700 transition">Organic T-Shirts</a></li>
                  <li><a href="/category/shirts" className="hover:text-emerald-700 transition">Pure Linen &amp; Oxford Shirts</a></li>
                  <li><a href="/category/bottoms" className="hover:text-emerald-700 transition">Stretch Chinos &amp; Trousers</a></li>
                  <li><a href="/category/knitwear" className="hover:text-emerald-700 transition">French Terry Sweatshirts</a></li>
                  <li><a href="/category/accessories" className="hover:text-emerald-700 transition">Canvas Bags &amp; Caps</a></li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-3">Customer Support</h4>
                <ul className="space-y-2">
                  <li><a href="#" className="hover:text-emerald-700 transition">Shipping &amp; Delivery Policy</a></li>
                  <li><a href="#" className="hover:text-emerald-700 transition">7-Day Return &amp; Exchange</a></li>
                  <li><a href="#" className="hover:text-emerald-700 transition">Size &amp; Fit Guide</a></li>
                  <li><a href="#" className="hover:text-emerald-700 transition">Track Your Order</a></li>
                  <li><a href="/api/health" className="hover:text-emerald-700 transition">System Status Diagnostic</a></li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-3">Delivery Assurances</h4>
                <p className="text-slate-500 leading-relaxed mb-3">
                  All India fast dispatch. Free delivery on orders above ₹999. Secured with 256-bit SSL encryption.
                </p>
                <div className="text-[11px] font-mono bg-slate-100 text-slate-600 p-2.5 rounded-lg border border-slate-200">
                  Prisma 7.10 • Neon PostgreSQL
                </div>
              </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-400">
              <p>&copy; {new Date().getFullYear()} MorningVeg Apparel. All rights reserved.</p>
              <p>Designed and engineered for Indian e-commerce.</p>
            </div>
          </footer>
        </CartProvider>
      </AuthProvider>
    </body>
  </html>
  );
}
