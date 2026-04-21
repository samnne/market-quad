import { NextRequest, NextResponse } from "next/server";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Routes that don't require auth
const PUBLIC_ROUTES = [
  "/api/auth/login",
  "api/auth/register"
 
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  // Skip public routes
  const isPublic = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
  
  
  if (isPublic) return NextResponse.next();
  // Only protect /api routes
  if (!pathname.startsWith("/api")) return NextResponse.next();

  const authHeader = req.headers.get("authorization");
  // console.log(authHeader)

  const userId = authHeader;


  if (!userId || !UUID_REGEX.test(userId)) {
    
    return NextResponse.json(
      { error: "Unauthorized", message: "Missing or invalid user ID" },
      { status: 401 }
    );
  }

 
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-user-id", userId);

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/api/:path*"],
};