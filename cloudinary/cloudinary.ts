import { v2 as cloudinary } from "cloudinary";
import pLimit from "p-limit";

cloudinary.config({
    api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
})

const limit = pLimit(10);

export async function uploadImages(images: File[]): Promise<string[]> {
  const imagesToUpload = images.map((image) => {
    return limit(async () => {
        const buffer = Buffer.from(await image.arrayBuffer());

      
      return new Promise<string>((resolve,rej)=>{
        cloudinary.uploader
            .upload_stream({folder: "/uploads"}, (error, res)=>{
                if (error || !res) return rej(error);
                resolve(res.secure_url);
            }).end(buffer);
      });
    });
  });

   return Promise.all(imagesToUpload);
}
