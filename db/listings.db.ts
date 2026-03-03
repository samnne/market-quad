'use server'
import { type Listing } from "../src/generated/prisma/client";
import { type ListingInclude } from "../src//generated/prisma/models";
import { prisma } from "./db";

export async function getListings(): Promise<Listing[]> {
  const listings = await prisma.listing.findMany({
    orderBy: {
      createdAt: "asc",
    },
    take: 10,
    where: {
      archived: false,
    },
    include: {
      seller: true,
    },
  });

  return listings;
}

export async function getOthersListings(uid: string): Promise<Listing[]> {
  const listings = await prisma.listing.findMany({
    orderBy: {
      createdAt: "asc",
    },
    take: 10,
    where: {
      sellerId: {
        not: uid
      }
    },
    include: {
      seller: true,
    },
  });
  return listings
}
export async function getUserListings(uid: string): Promise<Listing[]> {
  
  const listings = await prisma.listing.findMany({
    orderBy: {
      createdAt: "asc",
    },
    take: 10,
    where: {
      sellerId: uid
    },
    include: {
      seller: true,
    },
  });
  return listings
}

export async function getListingByID(
  lid: string,
): Promise<ListingInclude | Listing | null> {
  const listing = await prisma.listing.findUnique({
    where: {
      lid,
    },
    include: {
      seller: true,
    },
  });
  if (!listing) {
    return null;
  }

  return listing;
}

export async function createNewListing(
  listingData: listingFormData,
): Promise<Listing> {
  const listing = await prisma.listing.create({
    data: {
      ...listingData,
    },
  });

  return listing;
}

export async function updateListing(lid: string, listingData: listingFormData) {
  const listing = await prisma.listing.update({
    data: {
      ...listingData,
    },
    where: {
      lid,
    },
  });

  return listing;
}
export async function deleteListing(lid: string) {
  const listing = await prisma.listing.delete({
    where: {
      lid,
    },
  });

  return listing;
}
