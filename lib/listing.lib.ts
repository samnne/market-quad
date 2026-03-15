"use server";

import { BASEURL } from "@/app/server-utils/utils";
import { listingFormData } from "@/app/types";
const safeJson = async (response: Response) => {
  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
  }

  const text = await response.text();
  if (!text || text.trim() === "") return null;

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Failed to parse JSON response: "${text.slice(0, 100)}"`);
  }
};

export const getClientListings = async () => {
  const response = await fetch(`${BASEURL}/api/listings/`, {
    cache: "no-store",
  });

  return safeJson(response);
};
export const getClientListingsNotUsers = async (uid: string) => {
  const response = await fetch(`${BASEURL}/api/listings/`, {
    cache: "no-store",
    headers: {
      Authorization: uid,
    },
    method: "GET",
  });

  return safeJson(response);
};
export const newListingAction = async (
  newListing: listingFormData,
  sellerId: string,
) => {
  const response = await fetch(`${BASEURL}/api/listings/`, {
    method: "post",
    body: JSON.stringify({ ...newListing, sellerId }),
  });

  return safeJson(response);
};
export const editListingAction = async (
  listingToEdit: listingFormData,
  sellerId: string,
) => {
  const response = await fetch(`${BASEURL}/api/listings/${listingToEdit.lid}`, {
    headers: {
      Authorization: sellerId,
    },
    method: "PUT",
    body: JSON.stringify({ ...listingToEdit, sellerId }),
  });

  return safeJson(response);
};

export const deleteListingAction = async (lid: string, sellerId: string) => {
  if (!sellerId) return;
  const response = await fetch(`${BASEURL}/api/listings/${lid}`, {
    headers: {
      Authorization: sellerId,
    },
    method: "DELETE",
  });

  return safeJson(response);
};
