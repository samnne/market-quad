'use server';
import { prisma } from "@/db/db";
import { User } from "@/src/generated/prisma";

import { NextRequest, NextResponse } from "next/server";


type AuthResult =
  | { ok: true; user: User }
  | { ok: false; response: NextResponse };

/**
 * Call this at the top of any route.ts handler.
 * Middleware already validated the UUID format — this confirms
 * the user actually exists in the DB and returns the full record.
 *
 * Usage:
 *   const auth = await requireAuth(req);
 *   if (!auth.ok) return auth.response;
 *   const { user } = auth;
 */
export async function requireAuth(req: NextRequest): Promise<AuthResult> {
  const userId = req.headers.get("x-user-id");

  if (!userId) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const user = await prisma.user.findUnique({
    where: { uid: userId },
  });

  if (!user) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "User not found" },
        { status: 401 }
      ),
    };
  }

  if (user.hidden) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Account suspended" },
        { status: 403 }
      ),
    };
  }

  return { ok: true, user };
}

/**
 * Lightweight version — skips the DB lookup.
 * Use when you just need the ID (e.g. insert queries where
 * the FK constraint will catch a bad ID anyway).
 */
export async function getUserId(req: NextRequest): Promise<string | null> {
  return req.headers.get("x-user-id");
}