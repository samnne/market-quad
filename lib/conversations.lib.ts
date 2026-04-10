"use server";
import { prisma } from "@/db/db";

interface NewConvo {
  listingId: string;
  buyerId: string;
  sellerId: string;
  initialMessage: string; // just pass the text
}

export async function createConvo({
  listingId,
  buyerId,
  sellerId,
  initialMessage,
}: NewConvo) {
  const convo = await prisma.conversation.create({
    data: {
      listingId,
      buyerId,
      sellerId,
      messages: {
        create: {
          text: initialMessage,
          senderId: buyerId,
        },
      },
    },
    include: {
      messages: true,
    },
  });

  return convo;
}

export async function getConvos(uid: string) {
    
  const convos = await prisma.conversation.findMany({
    where: {
      OR: [{ buyerId: uid }, { sellerId: uid }],
    },
    include: {
      listing: true,
      buyer: true,
      seller: true,
      messages: true,
    },
  });

  if (!convos) return convos;
  return convos;
}
