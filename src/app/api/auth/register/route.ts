import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { hashPassword, signToken } from "@/lib/auth";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || "Validation error" },
        { status: 400 }
      );
    }

    const { name, email, password, phone } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user in Neon PostgreSQL
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name,
        passwordHash,
        phone: phone || null,
        role: "CUSTOMER",
      },
    });

    // Create associated user cart sequentially (avoiding nested transactions in HTTP mode)
    try {
      await prisma.cart.create({
        data: {
          userId: user.id,
        },
      });
    } catch {
      // Cart creation failure is non-fatal; cart can be created on first item addition
    }

    // Sign session token
    const token = await signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
        },
      },
      { status: 201 }
    );

    // Set secure HTTP-only cookie
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create account. Please try again." },
      { status: 500 }
    );
  }
}
