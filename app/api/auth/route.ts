import { deleteImages } from "@/cloudinary/cloudinary";
import { prisma } from "@/db/db";
import { requireAuth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);

  if (!auth.ok) return auth.response;

  const user = auth.user;

  try {
    const reportsForUser = await prisma.report.findMany({
      where: {
        OR: [{ targetUserId: user.uid }],
      },
    });

    return NextResponse.json({
      success: true,
      message: "Got User Reports",
      reports: reportsForUser,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: "Something went wrong...",
      reports: null,
    });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;

  const user = auth.user;
  try {
    if (!user.uid) {
      return NextResponse.json({
        success: false,
        message: "NO USER ID",
      });
    }

    const listings = await prisma.listing.findMany({
      where: { sellerId: user.uid },
      select: { lid: true, imageUrls: true },
    });

    await prisma.$transaction(async (tx) => {
      await tx.conversation.deleteMany({
        where: { OR: [{ buyerId: user.uid }, { sellerId: user.uid }] },
      });
      await tx.listing.deleteMany({ where: { sellerId: user.uid } });
      await tx.user.delete({ where: { uid: user.uid } });
    });

    for (const listing of listings) {
      await deleteImages(listing.imageUrls);
    }

    return NextResponse.json({
      success: true,
      message: "SUCCESS",
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({
      success: false,
      error,
      message: "SOMETHING WENT WRONG DELETING",
    });
  }
}
