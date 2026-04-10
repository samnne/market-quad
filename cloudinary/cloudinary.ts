"use server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
});

function getPublicId(url: string): string {
  const parts = url.split('/')
  const uploadIndex = parts.indexOf('upload')
  // skip 'upload' and the version segment (vXXXXXX)
  const relevantParts = parts.slice(uploadIndex + 2)
  const withExtension = relevantParts.join('/')
  return withExtension.replace(/\.[^/.]+$/, '') // strip file extension
}

export async function deleteImages(images: string[]) {
  for (const image of images) {
    
    const publicID = getPublicId(image)
    console.log(publicID)
    await cloudinary.uploader
      .destroy(publicID, { invalidate: true, resource_type: "image" })
      .then((res) => console.log(res))
      .catch((err) => console.log(err));
  }
}

export async function getCloudinarySignature() {
  const timestamp = Math.round(Date.now() / 1000);

  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder: "listings" },
    process.env.CLOUDINARY_API_SECRET!,
  );

  return {
    timestamp,
    signature,
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  };
}
