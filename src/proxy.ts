import { auth } from "@/auth";
import { appPath } from "@/src/lib/app-path";

export default auth((req) => {
  const hasAccessToken = Boolean(req.auth?.accessToken);
  const pathname = req.nextUrl.pathname;
  const normalizedPathname =
    pathname !== "/" && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;

  const publicExactRoutes = new Set([
    "/sign-in",
    "/sign-up",
    "/forgot-password",
  ]);
  const publicPrefixRoutes = ["/verify/", "/token/", "/v/"];

  const isPublicRoute =
    publicExactRoutes.has(normalizedPathname) ||
    publicPrefixRoutes.some((routePrefix) =>
      normalizedPathname.startsWith(routePrefix)
    );

  if (!hasAccessToken && !isPublicRoute) {
    return Response.redirect(new URL(appPath("/sign-in"), req.nextUrl.origin));
  }
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
