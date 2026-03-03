"use server";
import { v2 as cloudinary } from "cloudinary";
import pLimit from "p-limit";

cloudinary.config({
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
});

const limit = pLimit(10);

export async function uploadImages(images: File[]): Promise<string[]> {
  console.log(images)
  const imagesToUpload = images.map((image) => {
    return limit(async () => {
      if (typeof image !== "string") {
        
        const buffer = Buffer.from(await image.arrayBuffer());

        return new Promise<string>((resolve, rej) => {
          cloudinary.uploader
            .upload_stream({ folder: "/uploads" }, (error, res) => {
              if (error || !res) return rej(error);
              resolve(res.secure_url);
            })
            .end(buffer);
        });
      } else {
        return image;
      }
    });
    
  });

  return Promise.all(imagesToUpload);
}

export async function deleteImages(images: string[]) {
  for (let image of images) {
    const publicID = image.split("/");
    const uploadFolder = publicID.find((p) => p === "uploads");
    const png = publicID.find((p) => p.includes("png"));
    const file = png?.substring(0, png.indexOf("."));

    const combined = `${uploadFolder}/${file}`;
    console.log(combined);
    await cloudinary.uploader
      .destroy(combined, { invalidate: true, resource_type: "image" })
      .then((res) => console.log(res))
      .catch((err) => console.log(err));
  }
}
