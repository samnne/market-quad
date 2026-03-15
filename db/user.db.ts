'use server';
import { prisma } from "./db";

export async function setVerifiedUser(uid: string | undefined) {
    if (!uid) return { success: false}
  const user = await prisma.user.update({
    data: {
      isVerified: true,

    },
    where: {
      uid,
    },
  });
  if (!user) {
    return { success: false };
  }
  return { user, success: true };
}
