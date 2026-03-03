"use server";

import { BASEURL } from "@/app/server-utils/utils";
import { listingFormData, SafeUser } from "@/app/types";
import { uploadImages } from "@/cloudinary/cloudinary";
import { type Listing } from "@/src/generated/prisma/client";
import { encrypt } from "./lib";
import { cookies } from "next/headers";

export const getClientListings = async () => {
  const response = await fetch(`${BASEURL}/api/listings/`, {
    cache: "no-store",
  });

  return response.json();
};
export const getClientListingsNotUsers = async (uid: string) => {
  const response = await fetch(`${BASEURL}/api/listings/`, {
    cache: "no-store",
    headers: {
      Authorization: uid,
    },
    method: "GET",
  });

  return response.json();
};
export const newListingAction = async (
  newListing: listingFormData,
  sellerId: string,
) => {
  const uploadedUrls = await uploadImages(newListing.imageUrls);
  const uploadObj: listingFormData = {
    ...newListing,
    imageUrls: uploadedUrls,
  };
  const response = await fetch(`${BASEURL}/api/listings/`, {
    method: "post",
    body: JSON.stringify({ ...uploadObj, sellerId }),
  });

  return response.json();
};
export const editListingAction = async (
  listingToEdit: listingFormData,
  sellerId: string,
) => {
  const session = (await cookies()).get("session")?.value;
  if(!session) return;
  const uploadedUrls = await uploadImages(listingToEdit.imageUrls);
  const uploadObj = {
    ...listingToEdit,
    imageUrls: uploadedUrls,
  };
  const response = await fetch(`${BASEURL}/api/listings/${listingToEdit.lid}`, {
    headers: {
      Authorization: session,
    },
    method: "PUT",
    body: JSON.stringify({ ...uploadObj, sellerId }),
  });

  return response.json();
};

export const deleteListingAction = async (lid: string) => {
  const session = (await cookies()).get("session")?.value;
  if (!session) return;
  const response = await fetch(`${BASEURL}/api/listings/${lid}`, {
    headers: {
      Authorization: session,
    },
    method: "DELETE",
  });

  return response.json();
};
