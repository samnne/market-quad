import { prisma } from "@/db/db";
import { requireAuth } from "@/lib/auth";
import { onBoardingSchema, parseBody } from "@/lib/sanatize.lib";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;
  const uid = auth.user.uid;
  const result = await parseBody(req, onBoardingSchema);
  if ("error" in result) return result.error;
  const body = result.data;
  if (!body.notifications) {
    return NextResponse.json({
      message: "no notifications",
      success: false,
    });
  }
  try {
    const updatedUser = await prisma.user.update({
      where: {
        uid: uid,
      },
      data: {
        enabled_notifications: body.notifications
      },
    });
    return NextResponse.json({
      message: "Updated notifications preferences",
      success: true,
      user: updatedUser,
    });
  } catch (err) {
    return NextResponse.json({
      message: "failed to update",
      success: false,
      err,
    });
  }
}
