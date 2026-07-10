import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { AUTH_ROUTES, PUBLIC_ADMIN_ROUTES } from "@/lib/auth/constants";
import { isAdmin } from "@/lib/auth/roles";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminRoute = pathname.startsWith("/admin");
  const isPublicAdminRoute = PUBLIC_ADMIN_ROUTES.some(
    (route) => pathname === route
  );

  if (!isAdminRoute) {
    const { supabaseResponse } = await updateSession(request);
    return supabaseResponse;
  }

  const { supabaseResponse, user } = await updateSession(request);
  const userIsAdmin = isAdmin(user);

  if (isPublicAdminRoute) {
    if (userIsAdmin) {
      return NextResponse.redirect(new URL(AUTH_ROUTES.dashboard, request.url));
    }
    return supabaseResponse;
  }

  if (!user) {
    const loginUrl = new URL(AUTH_ROUTES.login, request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (!userIsAdmin) {
    const loginUrl = new URL(AUTH_ROUTES.login, request.url);
    loginUrl.searchParams.set("error", "unauthorized");
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
