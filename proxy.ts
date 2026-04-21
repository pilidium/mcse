import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import type { NextRequest, NextFetchEvent } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/admin(.*)",
  "/holdings(.*)",
  "/positions(.*)",
  "/watchlist(.*)",
  "/analyse(.*)",
]);

const handler = clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) auth.protect();
});

export function proxy(req: NextRequest, evt: NextFetchEvent) {
  return handler(req, evt);
}

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)",
    "/(api|trpc)(.*)",
  ],
};
