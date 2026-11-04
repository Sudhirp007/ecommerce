import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

const addressSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  street: z.string().min(5, "Street address is required"),
  landmark: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  postalCode: z.string().min(5, "Postal code is required"),
  country: z.string().default("India"),
  isDefaultShipping: z.boolean().default(false),
  isDefaultBilling: z.boolean().default(false),
});

export async function GET() {
  const session = await getSessionUser();
  if (!session?.userId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const addresses = await prisma.address.findMany({
      where: { userId: session.userId },
      orderBy: [{ isDefaultShipping: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ success: true, addresses });
  } catch (error) {
    console.error("Fetch addresses error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch addresses" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getSessionUser();
  if (!session?.userId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = addressSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // If marked as default shipping, reset previous defaults
    if (data.isDefaultShipping) {
      await prisma.address.updateMany({
        where: { userId: session.userId, isDefaultShipping: true },
        data: { isDefaultShipping: false },
      });
    }

    // If marked as default billing, reset previous defaults
    if (data.isDefaultBilling) {
      await prisma.address.updateMany({
        where: { userId: session.userId, isDefaultBilling: true },
        data: { isDefaultBilling: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        userId: session.userId,
        fullName: data.fullName,
        phone: data.phone,
        street: data.street,
        landmark: data.landmark || null,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        country: data.country,
        isDefaultShipping: data.isDefaultShipping,
        isDefaultBilling: data.isDefaultBilling,
      },
    });

    return NextResponse.json({ success: true, address }, { status: 201 });
  } catch (error) {
    console.error("Create address error:", error);
    return NextResponse.json({ success: false, error: "Failed to create address" }, { status: 500 });
  }
}
