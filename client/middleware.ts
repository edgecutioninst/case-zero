import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const session = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  if (session) {
    // RULE 1: If they ARE logged in, they belong on "/".
    // If they try to access "/landing", "/xyz", or anything else, push them to "/".
    if (pathname !== "/") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  } else {
    // RULE 2: If they are NOT logged in, they belong on "/landing".
    // If they try to access "/", "/xyz", or anything else, push them to "/landing".
    if (pathname !== "/landing") {
      return NextResponse.redirect(new URL("/landing", req.url));
    }
  }

  return NextResponse.next();
}

// This tells Next.js to watch ALL routes, EXCEPT for API routes and static files (like your images)
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - any file with an extension like .jpeg, .png, .svg
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
