import { Listing, User } from "@/src/generated/prisma/client";
import { create, StoreApi, UseBoundStore } from "zustand";
import { SafeUser } from "../types";
interface Store {
  type: FormType;
  changeType: Function;
}
export const useType = create((set) => {
  const store: Store = {
    type: "sign-in",
    changeType: (newType: string) => set({ type: newType }),
  };
  return { ...store };
});

type ListingStore = {
  listings: Listing[];
  setListings: Function;
  selectedListing: Listing | object;
  setSelectedListing: Function;
  reset: Function;
};

export const useListings: UseBoundStore<StoreApi<ListingStore>> = create(
  (set) => {
    return {
      listings: [],
      setListings: (listings: Listing[]) => set({ listings: listings }),
      selectedListing: {},
      setSelectedListing: (listing: Listing) =>
        set({ selectedListing: listing }),
      reset: () => set({ listings: [], selectedListing: {} }),
    };
  },
);

type UserState = {
  user: SafeUser | object;
  setUser: Function;
  userListings: Listing[];
  setUserListings: Function;
  reset: Function;
};
export const useUser: UseBoundStore<StoreApi<UserState>> = create((set) => {
  return {
    user: {
      name: "",
      createdAt: "",
      email: "",
      isVerified: false,
      session: "",
      profileURL: "",
      uid: "",
    },
    setUser: (user: SafeUser) => set({ user: user }),
    userListings: [],
    setUserListings: (listings: Listing[]) => set({ userListings: listings }),
    reset: () => set({ user: {}, userListings: [] }),
  };
});

type MessagePopUp = {
  error: boolean;
  success: boolean;
  setSuccess: Function;
  setError: Function;
};

export const useMessage: UseBoundStore<StoreApi<MessagePopUp>> = create(
  (set) => {
    return {
      error: false,
      success: false,
      setSuccess: (success: boolean) => set({ success: success }),
      setError: (error: boolean) => set({ error: error }),
    };
  },
);
