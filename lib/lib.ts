"use server";
import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";
import { NextRequest, NextResponse } from "next/server";
import { BASEURL } from "@/app/server-utils/utils";
import { User } from "@/src/generated/prisma/client";

const key = new TextEncoder().encode(process.env.JWT_SECRET);

const SECONDS = 60 * 60;

export async function decrypt(input: string): Promise<any> {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ["HS256"],
  });
  return payload;
}

interface UserSession extends User {
  expires: number;
}

export async function deleteUserForReals(uid: string) {
  const response = await fetch(`${BASEURL}/api/auth/`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ uid }),
  }).then((res) => res.json());

  if (response.success) {
    return true;
  } else {
    return false;
  }
}

export async function getSession(): Promise<UserSession | null> {
  try {
    const session = (await cookies()).get("session")?.value;
    
    if (!session) return null;
    return await decrypt(session)
  } catch (error) {
    console.log("Expired Token", error);
    await logout();
    return null;
  }
}

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(new Date(Date.now() + SECONDS * 1000))
    .sign(key);
}

export async function createSession(user: SafeUser) {
  const expires = new Date(Date.now() + SECONDS * 1000);
  const session = await encrypt({ ...user, expires });

  return session;
}

export async function login(formData: FormData) {
  try {
    const response = await fetch(`${BASEURL}/api/auth/login`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: formData.get("email"),
        password: formData.get("password"),
      }),
    }).then((res) => res.json());

    if (response?.uid) {
      (await cookies()).set("session", response?.session, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
      });

      return { ...response };
    } else {
      return {
        message: "Sorry, User doesn't exist, please Sign Up!",
      };
    }
  } catch (error) {
    console.log(error);
    return {
      message: "We're very sorry, our service is failing.",
    };
  }
}
export async function signup(formData: FormData) {
  try {
    if (formData.get("email")?.toString().match("[\w.-]+@uvic\.ca")) {
      return { error: "Email must match @uvic" };
    }

    const response = await fetch(`${BASEURL}/api/auth/register`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: formData.get("email"),
        password: formData.get("password"),
        name: formData.get("name"),
        profileURL: formData.get("profileURL")
          ? formData.get("profileURL")
          : "#",
      }),
    }).then((res) => res.json());

    if (response?.uid) {
      (await cookies()).set("session", response?.session, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
      });

      return { ...response };
    } else {
      return {
        message: "Failed to get User.",
      };
    }
  } catch (error) {}
}

export async function logout() {
  (await cookies()).set("session", "", { expires: new Date(0) });
}

export async function updateSession(request: NextRequest) {
  const session = request.cookies.get("session")?.value;
  console.log(request.cookies.get("session"));
  if (!session) return NextResponse.error();

  try {
    const parsed = await decrypt(session);
    parsed.expires = new Date(Date.now() + SECONDS * 1000);

    const res = NextResponse.next();
    res.cookies.set({
      name: "session",
      value: await encrypt(parsed),
      expires: parsed.expires,
    });
    return res;
  } catch (error) {
    NextResponse.error();
  }
}
