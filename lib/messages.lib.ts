"use server";
import { prisma } from "../db/db";
import { Conversation, User } from "../src/generated/prisma/client";


interface NewMessageProps {
  conversationId: string;
  text: string;
  senderId: string;
}

export async function sendMessage(newMessage: NewMessageProps, user: User) {
 
  if (!newMessage.conversationId) throw new Error("conversationId is required");
  if (user) {
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
      return { error: "Failed to send message", new_message: null };
    }

   
    return { success: true, message: "Message Sent", new_message: message };
  }

  return { error: "User not authenticated" };
}

export async function getMessagesForConvo(cid: string) {

  const messages = await prisma.message.findMany({
    where: {
      conversationId: cid,
    },
    
    orderBy: {
        createdAt:'asc'
    }

  });

  if (!messages) {
    return false;
  }
  return messages;
}
