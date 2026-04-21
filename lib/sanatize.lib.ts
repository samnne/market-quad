
import { NextResponse } from "next/server";
import { z } from "zod";

// ─── String helpers ───────────────────────────────────────────────────────────

/** Strip HTML/script tags, trim, enforce max length */
export const sanitizeString = (val: unknown, maxLen = 500): string => {
  if (typeof val !== "string") return "";
  return val
    .trim()
    .slice(0, maxLen)
    .replace(/<[^>]*>/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "");
};

/** Recursively sanitize all string values in an object */
export const sanitizeBody = <T extends Record<string, unknown>>(body: T): T => {
  return Object.fromEntries(
    Object.entries(body).map(([k, v]) => {
      if (typeof v === "string") return [k, sanitizeString(v)];
      if (typeof v === "object" && v !== null && !Array.isArray(v))
        return [k, sanitizeBody(v as Record<string, unknown>)];
      if (Array.isArray(v))
        return [
          k,
          v.map((i) => (typeof i === "string" ? sanitizeString(i) : i)),
        ];
      return [k, v];
    }),
  ) as T;
};

// ─── Zod schemas ──────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  uid: z.string().uuid(),
  email: z.string().email().max(255).toLowerCase(),
  name: z.string().min(1).max(100).trim(),
});

export const listingSchema = z.object({
  title: z.string().min(1).max(150).trim(),
  description: z.string().min(1).max(2000).trim(),
  price: z.number().int().min(0).max(999999),
  category: z.string().max(50).trim().optional(),
  condition: z.string().max(50).trim().optional(),
  sellerId: z.string().uuid(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  imageUrls: z.array(z.string().url()).max(10).optional(),
  archived: z.boolean().default(false).optional(),
  sold: z.boolean().default(false).optional(),
  views: z.number().int().min(0).default(0).optional(),
  createdAt: z.date().default(() => new Date()).optional(),
  lid: z.string().uuid().optional()
});

export const accountSchema = z.object({
  uid: z.string().uuid(),
});

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500).trim().optional(),
  revieweeId: z.string().uuid(),
  role: z.enum(["BUYER", "SELLER"]),
});

export const convoSchema = z.object({
  listingId: z.string().uuid(),
  buyerId: z.string().uuid(),
  sellerId: z.string().uuid(),
  initialMessage: z.string().nullable(),
});

export const messageSchema = z.object({
  conversationId: z.string().uuid(),
  text: z.string().min(1).max(2000).trim(),
  senderId: z.string().uuid(),
  user: z
    .object({
      uid: z.string().uuid(),
      createdAt: z.date(),
      email: z.string(),
      hidden: z.boolean(),
      isVerified: z.boolean(),
      name: z.string(),
      profileURL: z.string(),
      rating: z.number(),
    })
    .nullable(),
});

export const editMessageSchema = z.object({
  mid: z.string().uuid(),
  text: z.string().min(1).max(2000).trim(),
});

// ─── Helper: parse + return typed data or throw 400 response ─────────────────

export const parseBody = async <T>(
  req: Request,
  schema: z.ZodSchema<T>,
): Promise<{ data: T } | { error: NextResponse }> => {
  try {
    const raw = await req.json();
    const sanitized = sanitizeBody(raw as Record<string, unknown>);
    const parsed = schema.safeParse(sanitized);

    if (!parsed.success) {
      return {
        error: NextResponse.json(
          { error: "Validation failed", details: parsed.error.flatten() },
          { status: 400 },
        ),
      };
    }

    return { data: parsed.data };
  } catch {
    return {
      error: NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }),
    };
  }
};
