import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/db/db";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get("q");
    const category = searchParams.get("cat");
    const auth = await requireAuth(req);
    if (!auth.ok) {
      return auth.response;
    }
    const userId = auth.user.uid;
    if (!userId) {
      return NextResponse.json(
        { message: "User ID is required", listings: [], success: false },
        { status: 400 },
      );
    }
    
    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { message: "Search query is required", listings: [], success: false },
        { status: 400 },
      );
    }
   
    const listings = await prisma.listing.findMany({
      where: {
        archived: false,
        sellerId: { not: userId },
        OR: [
          {
            title: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            description: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            category: {
              contains: category ? category : "",
              mode: "insensitive",
            },
          },
        ],
      },
      include: {
        seller: true,
        conversations: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
    });

    return NextResponse.json({
      message: `Found ${listings.length} listings`,
      listings,
      success: true,
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      {
        message: "Failed to search listings",
        listings: [],
        success: false,
      },
      { status: 500 },
    );
  }
}
