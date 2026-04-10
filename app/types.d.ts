import { Conversation, Listing } from "@/src/generated/prisma/client";

import { User as SupabaseUser } from "@supabase/supabase-js";
import { User as PrismaUser } from "@/src/generated/prisma/client";

interface UserFormData {
  name: string;
  uid: string;
  email: string;
  password: string;
  profileURL: string;
  isVerified: boolean;
  createdAt: Date;
}

type ListingWithIncludes = Prisma.ListingGetPayload<{
  include: { seller: true; conversations: true }
}>

interface SafeUser {
  name: string;
  uid: string;
  email: string;

  profileURL: string;
  isVerified: boolean;
  createdAt: Date;
  session?: string;
}
interface listingFormData {
  condition: string;
  title: string;
  latitude?: number;
  longitude?: number;
  description: string;
  price: number;
  imageUrls: File[] | string[];
  sellerId: string;
  views?: number;
  category: string
}
type FormType = "sign-in" | "sign-up" | "otp";

type ListingStore = {
  listings: Listing[];
  setListings: (listings: Listing[])=> void;
  selectedListing: Listing | object;
  setSelectedListing: (listing: Listing)=> void;
  reset: ()=> void;
};
type UserState = {
  user: SafeUser | object;
  setUser: ()=> void;
  userListings: Listing[];
  setUserListings: (listings: Listing[])=> void;
  reset: ()=> void;
};
type ConvosState = {
  convos: (Conversation & ConversationInclude)[];
  setConvos: ()=> void;
  selectedConvo: Conversation;
  setSelectedConvo: ()=> void;
  reset: ()=> void;
};

export const mapToUserSession = (
  user: SupabaseUser,
  app_user?: PrismaUser
): UserSession => {
  return {
    uid: user.id,
    id: app_user?.id, // optional
    email: user.email ?? "",

    name:
      app_user?.name ||
      user.user_metadata?.name ||
      "",

    profileURL:
      app_user?.profileURL ||
      user.user_metadata?.avatar_url ||
      "",

    isVerified: app_user?.isVerified ?? false,
    rating: app_user?.rating ?? 0,
    createdAt: app_user?.createdAt ?? new Date(),

    app_user,
    user_metadata: user.user_metadata,
  };
};

import { Prisma } from "@/src/generated/prisma/client";

type ConvoWithRelations = Prisma.ConversationGetPayload<{
  include: {
    listing: true;
    messages: true;
    buyer: true;
    seller: true;
  };
}>;

import { Prisma } from "@/src/generated/prisma/client";

type ListingWithRelations = Prisma.ListingGetPayload<{
  include: {
    seller: true;
    conversations: true;
  };
}>;