import { prisma } from "@/db/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ cid: string }> },
) {
  const session = req.headers.get("authorization");

  if (!session) {
    return NextResponse.json({
      message: "Not Authorized",
      status: 500,
      success: false,
      convo: null,
    });
  }
  const { cid } = await params;
  try {
    const convo = await prisma.conversation.findFirst({
      where: {
        cid: cid,
      },
      include: {
        listing: true,
        messages: true,
        seller: true,
        buyer: true,
      },
    });

    return NextResponse.json({
      message: "Success getting Convo",
      success: true,
      convo,
      status: 200,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({
      message: "Failed to Get Convo",
      status: 500,
      convo: null,
      success: false,
    });
  }
}
export async function POST(req: NextRequest) {
  const session = req.headers.get("authorization");

  if (!session) {
    return NextResponse.json({
      message: "Not Authorized",
      status: 500,
      success: false,
      convo: null,
    });
  }

  try {
    const convo = await prisma.conversation.findFirst({
      where: {
        cid: session,
      },
      include: {
        listing: true,
        messages: true,
        seller: true,
        buyer: true,
      },
    });

    return NextResponse.json({
      message: "Success getting Convo",
      success: true,
      convo,
      status: 200,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({
      message: "Failed to Get Convo",
      status: 500,
      convo: null,
      success: false,
    });
  }
}


export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ cid: string }> }
) {
  const userId = req.headers.get("authorization");

  const { cid } = await params;
  if (!userId || !cid) {
    return NextResponse.json({ success: false, message: "Missing params" }, { status: 400 });
  }

  try {
    const convo = await prisma.conversation.findUnique({
      where: { cid },
    });

    if (!convo) {
      return NextResponse.json({ success: false, message: "Convo not found" }, { status: 404 });
    }

    // Determine which side the user is
    const isBuyer  = convo.buyerId  === userId;
    const isSeller = convo.sellerId === userId;
    
    if (!isBuyer && !isSeller) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    // Null out the user's reference
    const updated = await prisma.conversation.update({
      where: { cid },
      data: {
        buyerId:  isBuyer  ? null : convo.buyerId,
        sellerId: isSeller ? null : convo.sellerId,
      },
    });

    // If both are null — delete the entire conversation
    if (updated.buyerId === null && updated.sellerId === null) {
      await prisma.conversation.delete({ where: { cid } });
      return NextResponse.json({
        success: true,
        deleted: true,
        message: "Conversation fully deleted",
      });
    }

    return NextResponse.json({
      success: true,
      deleted: false,
      message: "Your reference removed",
    });

  } catch (err) {
    console.error("DELETE /api/convos/[cid]:", err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}