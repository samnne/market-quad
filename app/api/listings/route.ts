import { NextRequest, NextResponse } from "next/server.js"
import { getUserId, requireAuth } from "@/lib/auth";
import {
  createNewListing,
  getListings,
  getOthersListings,
  updateListing,
} from "@/db/listings.db";

import { Listing } from "@/src/generated/prisma/client";
import { ListingWithIncludes } from "@/app/types";

export async function GET(req: NextRequest) {
  const userId = await getUserId(req)

  try {
    if (userId) {
      return NextResponse.json({
        listings: await getOthersListings(userId),
        success: true,
      });
    }
    const listings = await getListings();

    return NextResponse.json({
      listings,
      success: true,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({
      message: "Failed to Fetch Listings",
      status: 500,
      success: false,
    });
  }
}
export async function POST(req: NextRequest) {
  const listingFormData = await req.json();

  try {
    const createdListing = await createNewListing(listingFormData);

    return NextResponse.json({
      message: "Successfully Created Listing",
      listing: createdListing,
      success: true,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({
      message: "Failed to Create Listing",
      status: 500,
      success: false,
    });
  }
}

/**
 *
 * Only to update a listing via archiving or marking sold, not to be confused with the
 * PUT by ID but we will send the id withing the listing with this route
 */
export async function PUT(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) {
    return auth.response;
  }
  const userID = auth.user.uid;

  if (!userID) {
    return NextResponse.json({
      success: false,
      message: "Must be Authorized",
    });
  }

  try {
    const listing: Listing & ListingWithIncludes = await req.json();
    if (!listing) {
      return NextResponse.json({
        success: false,
        message: "Must provide a listing",
      });
    }

    const updatedListing = await updateListing(listing.lid, {
      archived: listing.archived,
      category: listing.category,
      condition: listing.condition,
      createdAt: listing.createdAt,
      description: listing.description,
      imageUrls: listing.imageUrls,
      latitude: listing.latitude,
      longitude: listing.longitude,
      price: listing.price,
      sold: listing.sold,
      title: listing.title,
      views: listing.views,
    });

    return NextResponse.json(
      {
        message: "Succesfully updated Listing",
        listing: updatedListing,
        success: true,
      },
      { status: 200 },
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        message: "Must provide a listing",
        success: false,
      },
      {
        status: 500,
      },
    );
  }
}
