import { Conversation, Listing } from "@/src/generated/prisma/client";

interface UserFormData{
  name: string;
  uid: string;
  email: string;
  password: string;
  profileURL: string;
  isVerified: boolean;
  createdAt: Date;
}
interface SafeUser{
  name: string;
  uid: string;
  email: string;

  profileURL: string;
  isVerified: boolean;
  createdAt: Date;
  session?: string;
}
interface listingFormData {
  condition: string;
  title: string;
  latitude?:number;
  longitude?:number;
  description: string;
  price: number;
  imageUrls: File[] | string[];
  sellerId: string;
  views?: number;

}
type FormType = "sign-in" | "sign-up";
interface UserSession extends SafeUser {}
