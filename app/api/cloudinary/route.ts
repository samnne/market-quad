import { deleteImages, getCloudinarySignature } from "@/cloudinary/cloudinary";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { timestamp, signature, cloudName, apiKey } =
    await getCloudinarySignature();

  return NextResponse.json({
    timestamp,
    signature,
    cloudName,
    apiKey,
  });
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) {
    return auth.response;
  }
  const userId = auth.user.uid;
  const images = await req.json();
  if (!userId) {
    return NextResponse.json({
      message: "No User ID",
      success: false,
    });
  }


  try {
    await deleteImages(images as string[]);
    return NextResponse.json({
      message: "Successfully Deleted Images",
      success: true,
    });
  } catch (err) {
    return NextResponse.json({
      message: "Failed To Delete",
      success: false,
    });
  }
}
