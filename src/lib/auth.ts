import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "@/lib/db";

const JWT_SECRET = process.env.JWT_SECRET || "morningveg-apparel-dev-jwt-secret-key-32-chars-long";
const secretKey = new TextEncoder().encode(JWT_SECRET);

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  name?: string | null;
}

/**
 * Hash a plain-text password using pure JavaScript bcryptjs
 * (Zero native C++ binary dependencies, 100% portable on Windows, Linux, and Android Bionic).
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Verify a plain-text password against a stored bcrypt hash.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Sign a stateless JSON Web Token for customer/admin sessions.
 */
export async function signToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);
}

/**
 * Verify a stateless session JWT.
 */
export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

/**
 * Extract authenticated user session from Next.js server cookies.
 */
export async function getSessionUser(): Promise<TokenPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;
    if (!token) return null;
    return await verifyToken(token);
  } catch {
    return null;
  }
}

/**
 * Retrieve current user record with profile data from database.
 */
export async function getCurrentUser() {
  const session = await getSessionUser();
  if (!session?.userId) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            orders: true,
            addresses: true,
          },
        },
      },
    });
    return user;
  } catch (error) {
    console.error("Error fetching current user:", error);
    return null;
  }
}
