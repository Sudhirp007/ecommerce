import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { CheckCircle2, Package, ArrowRight, ShieldCheck, MapPin } from "lucide-react";

interface Props {
  params: Promise<{ orderNumber: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { orderNumber } = await params;
  return {
    title: `Order ${orderNumber} Confirmed | MorningVeg Apparel`,
  };
}

export default async function OrderSuccessPage({ params }: Props) {
  const { orderNumber } = await params;

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: true,
      payment: true,
    },
  });

  if (!order) {
    notFound();
  }

  const shippingAddr = order.shippingAddress as {
    fullName?: string;
    phone?: string;
    street?: string;
    landmark?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Success Hero */}
      <div className="bg-white rounded-3xl border border-stone-200 p-8 sm:p-10 shadow-sm text-center mb-8">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <span className="text-xs uppercase font-bold tracking-widest text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full">
          Order Confirmed
        </span>

        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 mt-3">
          Thank you for your order!
        </h1>

        <p className="text-sm text-stone-600 mt-2 max-w-md mx-auto">
          We have received your order and our fulfillment team is preparing your package for express dispatch.
        </p>

        <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono text-stone-700">
          <span>Order Number:</span>
          <strong className="text-stone-900 text-sm">{order.orderNumber}</strong>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Column: Order Items */}
        <div className="md:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
            <h2 className="text-base font-serif font-bold text-stone-900 mb-4 flex items-center gap-2">
              <Package className="w-4 h-4 text-emerald-800" />
              Purchased Apparel Items ({order.items.length})
            </h2>

            <div className="divide-y divide-stone-100">
              {order.items.map((item) => (
                <div key={item.id} className="py-3 flex items-start justify-between text-xs gap-3">
                  <div>
                    <p className="font-semibold text-stone-900">{item.productName}</p>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      SKU: <span className="font-mono">{item.sku}</span> • Size: <strong>{item.size}</strong> • Color: <strong>{item.color}</strong>
                    </p>
                    <p className="text-[11px] text-stone-400 mt-0.5">
                      Qty: {item.quantity} &times; ₹{Number(item.unitPrice)}
                    </p>
                  </div>
                  <div className="font-semibold text-stone-900">
                    ₹{Number(item.subtotal)}
                  </div>
                </div>
              ))}
            </div>

            {/* Price Snapshot Totals */}
            <div className="border-t border-stone-100 pt-3 mt-3 space-y-1.5 text-xs">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <span>₹{Number(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Shipping</span>
                <span>
                  {Number(order.shippingFee) === 0 ? (
                    <span className="text-emerald-700 font-bold uppercase text-[10px]">FREE</span>
                  ) : (
                    `₹${Number(order.shippingFee)}`
                  )}
                </span>
              </div>
              <div className="border-t border-stone-200 pt-2.5 flex justify-between font-bold text-stone-900 text-sm">
                <span>Grand Total</span>
                <span className="text-base font-serif text-emerald-900">₹{Number(order.grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Delivery Details & Actions */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-4 text-xs">
            <h2 className="text-base font-serif font-bold text-stone-900 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-800" />
              Delivery Address
            </h2>

            {shippingAddr && (
              <div className="text-stone-600 space-y-1">
                <p className="font-bold text-stone-900 text-sm">{shippingAddr.fullName}</p>
                <p>{shippingAddr.phone}</p>
                <p>{shippingAddr.street}</p>
                {shippingAddr.landmark && <p>Near: {shippingAddr.landmark}</p>}
                <p>
                  {shippingAddr.city}, {shippingAddr.state} - {shippingAddr.postalCode}
                </p>
                <p>{shippingAddr.country || "India"}</p>
              </div>
            )}

            <div className="pt-3 border-t border-stone-100 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-stone-500">Order Status:</span>
                <span className="px-2 py-0.5 rounded font-semibold text-emerald-800 bg-emerald-50 text-[11px]">
                  {order.status}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-stone-500">Payment Status:</span>
                <span className="px-2 py-0.5 rounded font-semibold text-amber-800 bg-amber-50 text-[11px]">
                  {order.paymentStatus}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100">
              <div className="flex items-center gap-2 text-[11px] text-stone-500">
                <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Estimated delivery: 3–5 business days</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Link
              href="/"
              className="w-full flex items-center justify-center gap-2 bg-stone-900 hover:bg-emerald-800 text-white font-medium py-3 rounded-xl text-xs transition shadow-sm"
            >
              Continue Shopping <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/account"
              className="w-full flex items-center justify-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium py-3 rounded-xl text-xs transition"
            >
              View in My Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
