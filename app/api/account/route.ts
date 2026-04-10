import { NextRequest, NextResponse } from "next/server";

import { getUserListings } from "@/db/listings.db";

export async function POST(req: NextRequest) {
  const uid = req.headers.get("authorization");
  const lid = await req.json();

  if (!uid) {
    return NextResponse.json({
      message: "Failed to Fetch Listings, no UID",
      status: 500,
      listings: [],
      success: false,
    });
  }
  try {
    const listings = await getUserListings(lid);

    return NextResponse.json({
      listings,
      success: true,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({
      message: "Failed to Fetch Listings",
      status: 500,
      listings: [],
      success: false,
    });
  }
}
