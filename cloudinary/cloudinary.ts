"use server";
import { v2 as cloudinary } from "cloudinary";
import pLimit from "p-limit";

cloudinary.config({
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
});

const limit = pLimit(10);

export async function uploadImages(
  images: (File | string)[],
): Promise<string[]> {
  const imagesToUpload = images.map((image) => {
    return limit(async () => {
      if (typeof image !== "string") {
        return await uploadImage(image)
        // const buffer = Buffer.from(await image.arrayBuffer());

        // return new Promise<string>((resolve, rej) => {
        //   cloudinary.uploader
        //     .upload_stream({ folder: "/uploads" }, (error, res) => {
        //       if (error || !res) return rej(error);
        //       resolve(res.secure_url);
        //     })
        //     .end(buffer);
        // });
      } else {
        return image;
      }
    });
  });

  return Promise.all(imagesToUpload);
}

async function uploadImage(file: File) {
  // 1. Get signature from your server
  const { timestamp, signature, cloudName, apiKey } =
    await getCloudinarySignature();

  // 2. Upload directly to Cloudinary
  const formData = new FormData();
  formData.append("file", file);
  formData.append("timestamp", String(timestamp));
  formData.append("signature", signature);
  formData.append("api_key", apiKey!);
  formData.append("folder", "listings");

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: formData },
  );

  const data = await res.json();
  return data.secure_url; // ✅ save this to your DB
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
