import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionUser();
  if (!session?.userId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    // Verify address ownership
    const existing = await prisma.address.findFirst({
      where: { id, userId: session.userId },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: "Address not found" }, { status: 404 });
    }

    await prisma.address.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Address deleted" });
  } catch (error) {
    console.error("Delete address error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete address" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionUser();
  if (!session?.userId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const existing = await prisma.address.findFirst({
      where: { id, userId: session.userId },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: "Address not found" }, { status: 404 });
    }

    const body = await req.json();

    if (body.isDefaultShipping) {
      await prisma.address.updateMany({
        where: { userId: session.userId, isDefaultShipping: true },
        data: { isDefaultShipping: false },
      });
    }

    const updated = await prisma.address.update({
      where: { id },
      data: body,
    });

    return NextResponse.json({ success: true, address: updated });
  } catch (error) {
    console.error("Update address error:", error);
    return NextResponse.json({ success: false, error: "Failed to update address" }, { status: 500 });
  }
}
