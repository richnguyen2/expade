import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Clerk temporarily disabled for diagnosis — re-enable after confirming Clerk prod config
export default function middleware(_req: NextRequest) {
  return NextResponse.next();
}

// 6. Configure which paths the middleware runs on
export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};