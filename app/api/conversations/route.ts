import { prisma } from "@/db/db";
import { getConvos } from "@/lib/conversations.lib";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) {
    return auth.response;
  }



  const convos = await getConvos(auth.user.uid);
  if (!convos) {
    return NextResponse.json(
      { message: "Failed to get convos", success: false, convos: null },
      { status: 500 },
    );
  }

  return NextResponse.json(
    { message: "Success", success: true, convos },
    { status: 200 },
  );
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) {
    return auth.response;
  }


  const body = await req.json();


  if (
    !body.sellerId ||
    !body.buyerId ||
    !body.listingId ||
    !body.initialMessage
  ) {
    return NextResponse.json(
      { message: "Missing required fields", success: false, convo: null },
      { status: 400 },
    );
  }
  try {
    const existing = await prisma.conversation.findFirst({
      where: {
        listingId: body.listingId,
        sellerId: body.sellerId,
      },
      include: { messages: true },
    }); 

    if (existing) {
    
      if (!existing.buyerId || !existing.sellerId) {
        const updated = await prisma.conversation.update({
          where: { cid: existing.cid },
          data: { buyerId: body.buyerId, sellerId: body.sellerId },
          include: { messages: true },
        });
        return NextResponse.json(
          { success: true, convo: updated },
          { status: 200 },
        );
      }

     
      return NextResponse.json(
        { success: true, convo: existing },
        { status: 200 },
      );
    }

 
    const convo = await prisma.conversation.create({
      data: {
        listingId: body.listingId,
        buyerId: body.buyerId,
        sellerId: body.sellerId,
        messages: {
          create: { text: body.initialMessage, senderId: body.buyerId },
        },
      },
      include: { messages: true },
    });

    return NextResponse.json(
      { message: "Success creating convo", success: true, convo },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to create convo", success: false, convo: null },
      { status: 500 },
    );
  }
}
