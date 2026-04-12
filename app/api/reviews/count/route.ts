
import { updateReviewCount } from "@/db/reviews.db";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) {
    return auth.response;
  }
  const userID = auth.user.uid;

  if (!userID) {
    return NextResponse.json({
      message: "Must be Authorized",
      success: false,
    });
  }

  const { user, rating, count } = await updateReviewCount(userID);

  return NextResponse.json({
    message: "Successfully calculated rating",
    user,
    rating,
    count
  });
}
