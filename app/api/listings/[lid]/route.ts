import { NextRequest, NextResponse } from "next/server";
import { getListingByID, updateListing, deleteListing } from "@/db/listings.db";
import { Listing } from "@/src/generated/prisma/client";
import { ListingInclude } from "@/src/generated/prisma/models";

import { ErrorMessage } from "@/app/server-utils/utils";
import { getSession } from "@/lib/lib";
import { deleteImages } from "@/cloudinary/cloudinary";
import { cookies } from "next/headers";

export async function GET(
  req: NextRequest,
  { params }: { params: { lid: string } },
) {
  const { lid } = params;
  try {
    if (!lid) {
      return NextResponse.json(ErrorMessage("ID not provided error", 500), {
        status: 500,
      });
    }
    let listing: (Listing & ListingInclude) | null = await getListingByID(lid);
    if (listing && listing?.sellerId !== listing?.seller) {
      listing = await updateListing(lid, {
        ...listing,
        views: listing.views + 1,
      });
    }
    return NextResponse.json({
      message: "Successfully found Listing",
      listing,
      success: true,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(ErrorMessage("Failed to Fetch Listing", 500), {
      status: 500,
    });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { lid: string } },
) {
  const session = req.headers.get("authorization");

  if (!session) {
    return NextResponse.json(ErrorMessage("Unauthorized", 401), {
      status: 401,
    });
  }

  const { lid } = await params;
  const listingFormData: listingFormData = await req.json();
  try {
    if (!lid) {
      return NextResponse.json(ErrorMessage("ID not provided error", 500), {
        status: 500,
      });
    }
    const listing = await updateListing(lid, listingFormData);

    return NextResponse.json(
      {
        message: "Succesfully updated Listing",
        listing,
        success: true,
      },
      { status: 200 },
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(ErrorMessage("Failed to Fetch Listing", 500), {
      status: 500,
    });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { lid: string } },
) {
  const session = req.headers.get("authorization");

  if (!session) {
    return NextResponse.json(ErrorMessage("Unauthorized", 401), {
      status: 401,
    });
  }

  const { lid } = await params;

  try {
    if (!lid) {
      return NextResponse.json(ErrorMessage("ID not provided error", 500), {
        status: 500,
      });
    }

    const listing = await deleteListing(lid);

    const val = await deleteImages(listing.imageUrls);
    console.log(val);
    return NextResponse.json(
      {
        message: "Succesfully deleted Listing",
        listing,
        success: true,
      },
      { status: 200 },
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(ErrorMessage("Failed to Fetch Listing", 500), {
      status: 500,
    });
  }
}
