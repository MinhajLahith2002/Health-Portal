import { NextRequest, NextResponse } from "next/server";
import { PUBLIC_ROUTES, ROLE_ROUTE_MAP } from "@/constants/routes";

const isPathMatch = (pathname: string, route: string) =>
  pathname === route || pathname.startsWith(`${route}/`);

const isPublicPath = (pathname: string) =>
  PUBLIC_ROUTES.some((route) => isPathMatch(pathname, route));

const redirectToLogin = (request: NextRequest) =>
  NextResponse.redirect(new URL("/login", request.url));

const redirectToRoleDashboard = (request: NextRequest, role: string) => {
  const dashboard = ROLE_ROUTE_MAP[role];
  return dashboard
    ? NextResponse.redirect(new URL(dashboard, request.url))
    : redirectToLogin(request);
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get("healthbridge_token")?.value;
  const userCookie = request.cookies.get("healthbridge_user")?.value;

  if (!token || !userCookie) {
    return redirectToLogin(request);
  }

  try {
    const user = JSON.parse(decodeURIComponent(userCookie));
    const role = user?.role as string | undefined;

    if (!role || !ROLE_ROUTE_MAP[role]) {
      return redirectToLogin(request);
    }

    const requestedDashboard = Object.entries(ROLE_ROUTE_MAP).find(([, route]) =>
      isPathMatch(pathname, route)
    );

    if (requestedDashboard && requestedDashboard[0] !== role) {
      return redirectToRoleDashboard(request, role);
    }
  } catch {
    return redirectToLogin(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
