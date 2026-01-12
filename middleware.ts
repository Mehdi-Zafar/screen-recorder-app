import { NextRequest, NextResponse } from "next/server";
import { auth } from "./lib/auth";
import { headers } from "next/headers";

const protectedRoutes = [
  "/profile",
  "/upload",
  "/settings",
  "/dashboard",
];

/**
 * Routes that are always public (no auth required)
 */
const publicRoutes = [
  "/",
  "/library",
  "/video",
  "/about",
  "/contact",
];

/**
 * Check if a path starts with any of the given routes
 */
function matchesRoute(pathname: string, routes: string[]): boolean {
  return routes.some((route) => pathname.startsWith(route));
}

export default async function authMiddleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Get session
  const session = await auth.api.getSession({ headers: await headers() });

  // Check if route is protected
  const isProtectedRoute = matchesRoute(pathname, protectedRoutes);
  const isPublicRoute = matchesRoute(pathname, publicRoutes);
  const isAuthRoute = pathname.startsWith("/auth");

  // Handle protected routes - require authentication
  if (isProtectedRoute && !session) {
    const signInUrl = new URL("/auth/sign-in", request.url);
    // Add callback URL to redirect back after sign in
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Handle auth routes - redirect authenticated users away
  if (isAuthRoute && session) {
    // Check if there's a callback URL to redirect to
    const callbackUrl = request.nextUrl.searchParams.get("callbackUrl");
    const redirectUrl = callbackUrl || "/";
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  // Allow public routes and all other routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|__nextjs_devtools__|assets).*)",
  ],
};
