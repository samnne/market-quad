"use server";

import { BASEURL } from "@/app/server-utils/utils";
import { uploadImages } from "@/cloudinary/cloudinary";
import { type Listing } from "@/src/generated/prisma/client";

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
        'Authorization': uid
    },
    method: "GET"
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
    cache: "no-store",
    method: "post",
    body: JSON.stringify({ ...uploadObj, sellerId }),
  });

  return response.json();
};
