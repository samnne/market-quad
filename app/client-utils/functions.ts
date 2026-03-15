"use client";

import { getCloudinarySignature } from "@/cloudinary/cloudinary";
import { getConvos } from "@/lib/conversations.lib";
import { getSession } from "@/lib/lib";
import {
  getClientListings,
  getClientListingsNotUsers,
} from "@/lib/listing.lib";
import { supabase } from "@/supabase/authHelper";
import pLimit from "p-limit";
import { ConvosState, ListingStore, UserState } from "../types";


export function cleanUP(listingStore: ListingStore, userStore: UserState, convoStore: ConvosState) {
  userStore.reset();
  listingStore.reset();
  convoStore.reset()
}

export async function fetchConvos({ setter }: { setter: Function }) {
  const { data, error } = await supabase.auth.getUser();
  if (!data.user) {
    return false
  } else {
    const temp = await getConvos(data.user?.id);
    setter(temp);

    return temp;
  }
}

export const fetchListings = async ({ setter }: { setter: Function }) => {
  const { data, error } = await supabase.auth.getUser();
  if (!data.user) {
    const temp = await getClientListings();
    setter(temp?.listings);

    return temp;
  } else {
    const temp = await getClientListingsNotUsers(data.user?.id);
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
        return await uploadImage(image);
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
  return data.secure_url;
}

export async function getUserSupabase() {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    return false;
  }

  return { user: data.user };
}
