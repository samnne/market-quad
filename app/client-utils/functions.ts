"use client";

import { getCloudinarySignature } from "@/cloudinary/cloudinary";
import { getConvos } from "@/lib/conversations.lib";

import {
  getClientListings,
  getClientListingsNotUsers,
} from "@/lib/listing.lib";
import { supabase } from "@/supabase/authHelper";
import pLimit from "p-limit";

import { ImageLoaderProps } from "next/image";
import { Listing } from "@/src/generated/prisma/client";

export const cloudinaryLoader = ({ src, width, quality }: ImageLoaderProps) => {
  const transforms = `c_fill,w_${width},q_${quality ?? 75},f_auto`;
  return src.replace("/upload/", `/upload/${transforms}/`);
};

export function cleanUP(
  listingStore: {reset: ()=>void},
  userStore: {reset: ()=>void},
  convoStore: {reset: ()=>void},
) {
  userStore.reset();
  listingStore.reset();
  convoStore.reset();
}

export function matchUVIC(email: string) {
  const testerEmail = process.env.NEXT_PUBLIC_EMAIL_TESTER;
  if (email === testerEmail) {
    return true;
  }
  return email.includes("@uvic");
}

export async function fetchConvos({
  setter,
}: {
  setter: (data: object[]) => void;
}) {
  const user = await getUserSupabase();
  if (!user.user) {
    return false;
  } else {
    const temp = await getConvos(user.user?.id);
    setter(temp);

    return temp;
  }
}

export const fetchListings = async ({
  setter,
}: {
  setter: (listings: Listing[]) => void;
}) => {
  const { data } = await supabase.auth.getUser();
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
    return { user: null, error, app_user: null };
  }
  const user = await supabase
    .from("User")
    .select("*")
    .eq("uid", data.user.id)
    .single();
  const supa_user = data.user;
  return { user: supa_user, app_user: user.data };
}
