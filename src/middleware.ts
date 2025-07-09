import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "@/app/lib/auth0";

export async function middleware(request: NextRequest) {
  const authRes = await auth0.middleware(request);

  if (request.nextUrl.pathname.startsWith("/auth")) {
    return authRes;
  }

  const session = await auth0.getSession(request);

  if (!session) {
    // user is not authenticated, redirect to login page
    return NextResponse.redirect(
      new URL("/auth/login", request.nextUrl.origin)
    );
  }

  const { token } = await auth0.getAccessToken(request, authRes);

  const response = authRes;
  if (token) {
    response.cookies.set("access_token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
    });
  }
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - the homepage ("/")
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|$).*)",
  ],
};
