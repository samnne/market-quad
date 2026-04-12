import { getPreferences } from "@/lib/preferences.lib";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (!auth.ok) {
    return auth.response;
  }
  const userId = auth.user.uid;
  if (!userId) {
    return NextResponse.json({
      message: "Failed to Fetch Listings, no UID",
      status: 500,
      success: false,
    });
  }
  const { success, preferences } = await getPreferences(userId);

  return NextResponse.json({
    message: "Got Prefs",
    success,
    preferences,
  });
}
