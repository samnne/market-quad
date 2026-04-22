import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/db/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ uid: string }> },
) {
  const auth = await requireAuth(req);
  if (!auth.ok) {
    return auth.response;
  }
  const authUser = auth.user.uid;
  const {uid }= await params
  if (!authUser) {
    return NextResponse.json({
      message: "Failed to Fetch User, no UID",
      status: 500,
      data: null,
      success: false,
    });
  }
  try {
    const user = await prisma.user.findFirst({
      where: {
        uid: uid,
      },
      include: {
        listings: {
          where: {
            archived: false,
          },
          include: {
            likes: true
          }
        },
        reviewsReceived: true,
      },
    });

    return NextResponse.json({
      data: user,
      success: true,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({
      message: "Failed to Fetch User",
      status: 500,
      data: null,
      success: false,
    });
  }
}
