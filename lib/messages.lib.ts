"use server";
import { prisma } from "../db/db";
import { User } from "../src/generated/prisma/client";

interface NewMessageProps {
  conversationId: string;
  text: string;
  senderId: string;
}

export async function sendMessage(newMessage: NewMessageProps, uid: string) {
  if (!newMessage.conversationId) throw new Error("conversationId is required");
  if (uid) {
    const message = await prisma.message.create({
      data: {
        text: newMessage.text,
        sender: {
          connect: { uid: newMessage.senderId },
        },
        conversation: {
          connect: { cid: newMessage.conversationId },
        },
      },
    });


    if (!message) {
      console.error("Error sending message:");
      return {
        error: "Failed to send message",
        success: false,
        new_message: null,
        message_text: newMessage.text,
      };
    }

    return { success: true, message: "Message Sent", new_message: message };
  }

  return { error: "User not authenticated", new_message: null };
}

export async function getMessagesForConvo(cid: string) {
  const messages = await prisma.message.findMany({
    where: {
      conversationId: cid,
    },

    orderBy: {
      createdAt: "asc",
    },
  });

  if (!messages) {
    return false;
  }
  return messages;
}
