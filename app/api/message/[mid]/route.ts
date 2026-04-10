import { sendMessage } from "@/lib/messages.lib";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ mid: string }> },
) {
  const session = req.headers.get("authorization");
  const body = await req.json();
  const { mid } = await params;
 
  if (!session || !mid) {
    return NextResponse.json({
      message: "Not Authorized LOL",
      status: 500,
      success: false,
      convo: null,
    });
  }

  try {
    const response = await sendMessage(
      {
        conversationId: body.conversationId as string,
        senderId: body.senderId as string,
        text: body.text as string,
      },
      body.user,
    );

    return NextResponse.json({
      message: "Success creating Message",
      success: true,
      new_message: response.new_message,
      status: 200,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({
      message: "Failed to create Message",
      status: 500,
      new_message: null,
      success: false,
    });
  }
}
