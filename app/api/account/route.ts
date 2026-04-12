import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

import { getUserListings } from "@/db/listings.db";

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) {
    console.log(auth.response)
    return auth.response;
  }
  const uid = auth.user.uid;
  const lid = await req.json();
  console.log(uid);
  if (!uid) {
    return NextResponse.json({
      message: "Failed to Fetch Listings, no UID",
      status: 500,
      listings: [],
      success: false,
    });
  }
  try {
    const listings = await getUserListings(lid?.uid ?? uid);

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
