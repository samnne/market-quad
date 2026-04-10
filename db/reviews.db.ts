import { prisma } from "./db";

export async function updateReviewCount(userID: string) {
  const reviews_for_user = await prisma.review.findMany({
    where: {
      OR: [{ revieweeId: userID }, { reviewerId: userID }],
    },
  });

  let rating = 0;
  for (const review of reviews_for_user) {
    rating += review.rating;
  }
  rating /= reviews_for_user.length;
  rating = parseFloat(rating.toFixed(2));
  
  const user = await prisma.user.update({
    where: {
      uid: userID,
    },
    data: {
      rating: rating,
    },
  });
  return {user, rating, count: reviews_for_user.length}
}
