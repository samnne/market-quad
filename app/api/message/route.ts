import { prisma } from "@/db/db";
import { getConvos } from "@/lib/conversations.lib";
import { getMessagesForConvo } from "@/lib/messages.lib";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) {
    return auth.response;
  }
  const session = auth.user.uid
  if (!session) {
      return NextResponse.json({
          message: "Not Authorized",
          status: 500,
          success: false,
          convos: null,
        });
    }
    const cid = req.nextUrl.searchParams?.get('cid');


  const messages = await getMessagesForConvo(cid!);
  if (!messages) {
    return NextResponse.json({
      message: "Failed to Get messages",
      status: 500,
      messages: messages,
      success: false,
    });
  }
  return NextResponse.json({
    message: "Success getting messages",
    success: true,
    messages,
    status: 200,
  });
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) {
    return auth.response;
  }
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
