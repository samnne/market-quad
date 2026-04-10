import { Conversation, Listing } from "@/src/generated/prisma/client";


export interface UserFormData {
  name: string;
  uid: string;
  email: string;
  password: string;
  profileURL: string;
  isVerified: boolean;
  createdAt: Date;
}

export type ListingWithIncludes = Prisma.ListingGetPayload<{
  include: { seller: true; conversations: true }
}>

export interface SafeUser {
  name: string;
  uid: string;
  email: string;

  profileURL: string;
  isVerified: boolean;
  createdAt: Date;
  session?: string;
}
export interface listingFormData {
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
export type FormType = "sign-in" | "sign-up" | "otp";

export type ListingStore = {
  listings: Listing[];
  setListings: (listings: Listing[])=> void;
  selectedListing: Listing | object;
  setSelectedListing: (listing: Listing)=> void;
  reset: ()=> void;
};
export type UserState = {
  user: SafeUser | object;
  setUser: ()=> void;
  userListings: Listing[];
  setUserListings: (listings: Listing[])=> void;
  reset: ()=> void;
};
export type ConvosState = {
  convos: (Conversation & ConversationInclude)[];
  setConvos: ()=> void;
  selectedConvo: Conversation;
  setSelectedConvo: ()=> void;
  reset: ()=> void;
};



export type ConvoWithRelations = Prisma.ConversationGetPayload<{
  include: {
    listing: true;
    messages: true;
    buyer: true;
    seller: true;
  };
}>;


export type ListingWithRelations = Prisma.ListingGetPayload<{
  include: {
    seller: true;
    conversations: true;
  };
}>;