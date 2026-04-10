"use client";
import { UserInclude } from "@/src/generated/prisma/models";
import { type User } from "../../src/generated/prisma/client";


import { SafeUser } from "../types";

export function simplifyUserData(user: User & UserInclude): SafeUser {
  return {
    uid: user.uid,
    email: user.email,
    name: user.name,
    profileURL: user.profileURL,
    isVerified: user.isVerified,
    createdAt: user.createdAt,
  };
}


export function ErrorMessage(
  message: string,
  status: number,
  ...args: Array<string | number | null>
): object {
  return {
    message,
    status,
    ...args,
  };
}

// export async function hashPassword(password: string): Promise<string> {
//   const saltRounds = 8;
//   return await bcrypt.hashSync(password, saltRounds);
// }
// export async function verifyPassword(password: string, hash: string) {

//   return await bcrypt.compareSync(password, hash);
// }
