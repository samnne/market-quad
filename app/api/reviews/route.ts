import { prisma } from "@/db/db";
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
  const reviews = await prisma.review.findMany({
    where: {
      OR: [{ revieweeId: userID }, { reviewerId: userID }],
    },
  });

  return NextResponse.json({
    message: "Successfully retrieved reviews",
    success: true,
    reviews,
  });
}
export async function POST(req: NextRequest) {
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
  const newReview = await req.json();

  const review = await prisma.review.upsert({
    where: {
      reviewerId_revieweeId_role: {
        reviewerId: userID,
        revieweeId: newReview.revieweeId,
        role: newReview.role,
      },
    },
    update: {
      rating: newReview.rating,
      comment: newReview.comment,
    },
    create: {
      rating: newReview.rating,
      comment: newReview.comment,
      revieweeId: newReview.revieweeId,
      reviewerId: userID,
      role: newReview.role,
    },
  });

  await updateReviewCount(newReview.revieweeId);

  return NextResponse.json({
    message: "Successfully retrieved reviews",
    success: true,
    review,
  });
}
