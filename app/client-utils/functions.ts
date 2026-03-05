"use client";

import { getCloudinarySignature } from "@/cloudinary/cloudinary";
import { getSession } from "@/lib/lib";
import { getClientListings, getClientListingsNotUsers } from "@/lib/listing.lib";
import pLimit from "p-limit";

export function cleanUP(listingStore, userStore) {
    
  userStore.reset();
  listingStore.reset();
}

export const fetchListings = async ({setter}: {setter: Function}) => {
  const session = await getSession();
  if (!session) {
    const temp = await getClientListings();
    setter(temp?.listings);

    return temp;
  } else {
    const temp = await getClientListingsNotUsers(session?.uid);
    setter(temp?.listings);

    return temp;
  }
};

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