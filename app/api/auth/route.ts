import { deleteImages } from "@/cloudinary/cloudinary";
import { prisma } from "@/db/db";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest) {
  const { uid } = await req.json();
  try {
    if (!uid) {
      return NextResponse.json({
        success: false,
      });
    }

    const deletedUser = await prisma.user.delete({
      where: {
        uid: uid,
      },   
      include: {
        listings: true
      }   
    });



    for (const listing of deletedUser.listings){
      await deleteImages(listing.imageUrls);
    }

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
    });
  }
}
