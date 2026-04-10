import { Listing, User, UserPreferences } from "@/src/generated/prisma/client";

import { UserMetadata } from "@supabase/supabase-js";

import { create, StoreApi, UseBoundStore } from "zustand";
import { ConvoWithRelations, ListingWithRelations } from "../types";

export interface Store {
  type: "sign-in" | "sign-up" | "otp";
  changeType: (newType: "sign-in" | "sign-up" | "otp") => void;
}
export const useType = create<Store>((set) => {
  const store: Store = {
    type: "sign-in",
    changeType: (newType: "sign-in" | "sign-up" | "otp") =>
      set({ type: newType }),
  };
  return { ...store };
});

export type ListingStore = {
  listings: Listing[];
  setListings: (listings: Listing[]) => void;
  selectedListing?: Listing | null;
  setSelectedListing: (listing:ListingWithRelations | null) => void;
  reset: () => void;
};

export const useListings: UseBoundStore<StoreApi<ListingStore>> = create(
  (set) => {
    return {
      listings: [],
      setListings: (listings: Listing[]) => set({ listings: listings }),
      selectedListing: null,
      setSelectedListing: (listing: ListingWithRelations | null) =>
        set({ selectedListing: listing }),
      reset: () => set({ listings: [], selectedListing: null }),
    };
  },
);
export type UserSession = {
  uid: string;
  id?: string;
  name: string;
  email: string;
  profileURL: string;
  isVerified: boolean;
  rating: number;
  createdAt: Date;
  app_user?: User;
  user_metadata?: UserMetadata;
};
export type UserState = {
  user: UserSession | null;
  setUser: (user: UserSession | null) => void;
  userListings: Listing[];
  setUserListings: (listings: Listing[]) => void;
  reset: () => void;
  preferences: UserPreferences | null;
  setPreferences: (p: UserPreferences | null) => void;
};
export const useUser: UseBoundStore<StoreApi<UserState>> = create((set) => {
  return {
    user: null,
    setUser: (user: UserSession | null) => set({ user: user }),
    userListings: [],
    setUserListings: (listings: Listing[]) => set({ userListings: listings }),
    reset: () => set({ user: null, userListings: [] }),
    preferences: null,
    setPreferences: (pref: UserPreferences | null) =>
      set({ preferences: pref }),
  };
});

export type MessagePopUp = {
  error: boolean;
  success: boolean;
  setSuccess: (bool: boolean) => void;
  setError: (bool: boolean) => void;
  msg: string;
  setMessage: (msg: string) => void;
};

export const useMessage: UseBoundStore<StoreApi<MessagePopUp>> = create(
  (set) => {
    return {
      error: false,
      success: false,
      msg: "",
      setSuccess: (success: boolean) => set({ success: success }),
      setError: (error: boolean) => set({ error: error }),
      setMessage: (msg: string) => set({ msg: msg }),
    };
  },
);

export type ConvosState = {
  convos: ConvoWithRelations[] | null;
  setConvos: (convos: ConvoWithRelations[]) => void;
  selectedConvo: ConvoWithRelations | null;
  setSelectedConvo: (convo: ConvoWithRelations) => void;
  reset: () => void;
};
export const useConvos: UseBoundStore<StoreApi<ConvosState>> = create((set) => {
  return {
    convos: null,
    selectedConvo: null,
    setSelectedConvo: (convo: ConvoWithRelations) =>
      set({ selectedConvo: convo }),
    setConvos: (convos: ConvoWithRelations[]) => set({ convos: convos }),
    reset: () => set({ convos: null, selectedConvo: null }),
  };
});
export interface ReviewModalState {
  reviewModal: boolean;
  setReviewModal: (show: boolean) => void;
  makeReview: boolean;
  setMakeAReview: (show: boolean) => void;
  reset: () => void;
}

export const useReviewModal: UseBoundStore<StoreApi<ReviewModalState>> = create(
  (set) => {
    return {
      reviewModal: false,
      setReviewModal: (show: boolean) =>
        set({
          reviewModal: show,
        }),
      makeReview: false,
      setMakeAReview: (show: boolean) => set({ makeReview: show }),
      reset: () => set({ reviewModal: false, makeReview: false }),
    };
  },
);
