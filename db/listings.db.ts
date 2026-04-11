"use server";
import { prisma } from "./db";

import {
  ListingCreateInput,
  ListingUpdateInput,
} from "../src/generated/prisma/models";
import { ListingWithIncludes } from "@/app/types";

export async function getListings(): Promise<ListingWithIncludes[]> {
  return prisma.listing.findMany({
    orderBy: { createdAt: "asc" },
    take: 10,
    where: { archived: false },
    include: { seller: true, conversations: true },
  });
}

export async function getOthersListings(
  uid: string,
): Promise<ListingWithIncludes[]> {
  return prisma.listing.findMany({
    orderBy: { createdAt: "asc" },
    take: 10,
    where: { sellerId: { not: uid }, archived: false },
    include: { seller: true, conversations: true },
  });
}

export async function getUserListings(
  uid: string,
): Promise<ListingWithIncludes[]> {
  return prisma.listing.findMany({
    orderBy: { createdAt: "asc" },
    take: 10,
    where: { sellerId: uid },
    include: { seller: true, conversations: true },
  });
}

export async function getListingByID(
  lid: string,
): Promise<ListingWithIncludes | null> {
  return prisma.listing.findUnique({
    where: { lid },
    include: { seller: true, conversations: true },
  });
}

export async function createNewListing(listingData: ListingCreateInput) {
  return prisma.listing.create({ data: { ...listingData } });
}

export async function updateListing(
  lid: string,
  listingData: ListingUpdateInput,
): Promise<ListingWithIncludes> {
  return prisma.listing.update({
    data: { ...listingData },
    where: { lid },
    include: { seller: true, conversations: true },
  });
}

export async function deleteListing(lid: string) {
  return prisma.listing.delete({ where: { lid } });
}
