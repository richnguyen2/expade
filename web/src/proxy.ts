import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// 1. Define which routes are "Admin-only"
const isAdminRoute = createRouteMatcher(['/admin(.*)']);

export default clerkMiddleware(async (auth, req) => { // 1. Make this function async
  if (isAdminRoute(req)) {
    // 2. Await the auth() call
    const { sessionClaims } = await auth();

    // 3. Access the role (if it's flat now, no need for JSON.parse!)
    const role = sessionClaims?.role;

    if (role !== 'Admin') {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }
});

// 6. Configure which paths the middleware runs on
export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};