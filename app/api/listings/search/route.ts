import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/db";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get("q");
    const userId = req.headers.get("authorization");

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { message: "Search query is required", listings: [], success: false },
        { status: 400 }
      );
    }

    // Search listings by title and description
    const listings = await prisma.listing.findMany({
      where: {
        archived: false,
        ...(userId ? { sellerId: { not: userId } } : {}),
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
      { status: 500 }
    );
  }
}
