import { NextRequest, NextResponse } from "next/server";
import { deleteListing, getListingByID, updateListing } from "@/db/listings.db";


import { deleteImages } from "@/cloudinary/cloudinary";

function ErrorMessage(message: string, code: number) {
  return { message, code, success: false };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ lid: string }> },
) {
  const { lid } = await params;
  try {
    if (!lid) {
      return NextResponse.json(ErrorMessage("ID not provided error", 500), {
        status: 500,
      });
    }
    let listing = await getListingByID(lid);
    
    if (!listing) {
      console.log(listing)
      return NextResponse.json(ErrorMessage("Failed to Fetch Listing", 500), {
        status: 500,
      });
    } else {
      listing = await updateListing(lid, {
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
  { params }: { params: Promise<{ lid: string }> },
) {
  const session = req.headers.get("authorization");

  if (!session) {
    return NextResponse.json(ErrorMessage("Unauthorized", 401), {
      status: 401,
    });
  }

  const { lid } = await params;
  const listingFormData = await req.json();
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
  { params }: { params: Promise<{ lid: string }> },
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

    const listing = await getListingByID(lid);

    if (!listing) {
      return NextResponse.json(ErrorMessage("Listing not found", 404), {
        status: 404,
      });
    }

    // Delete images from Cloudinary first
    if (listing.imageUrls?.length) {
      await deleteImages(listing.imageUrls as string[]);
    }

    // Actually delete the listing from DB
    await deleteListing(lid);

    return NextResponse.json(
      { message: "Successfully deleted Listing", success: true },
      { status: 200 },
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(ErrorMessage("Failed to Delete Listing", 500), {
      status: 500,
    });
  }
}
