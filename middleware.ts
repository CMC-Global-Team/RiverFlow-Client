/**
 * Next.js Middleware - Bảo vệ routes ở server-side
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Danh sách các route cần bảo vệ (yêu cầu authentication)
const protectedRoutes = [
  "/dashboard",
  "/editor",
];

// Danh sách các route chỉ dành cho user chưa đăng nhập
const publicOnlyRoutes: string[] = [
  // Ví dụ: "/login", "/register" nếu có page riêng
];

// Danh sách các route public (không cần authentication)
const publicRoutes = [
  "/accept-invitation",
  "/reject-invitation",
  "/verify-invitation",
  "/public-mindmap",
];

/**
 * Middleware function
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Lấy accessToken từ localStorage thông qua cookie hoặc header
  // Note: localStorage không available ở server-side, cần dùng cookie
  const accessToken = request.cookies.get("accessToken")?.value;
  
  const isAuthenticated = !!accessToken;

  // Check if route is public (allowed for everyone)
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // If public route, allow access regardless of authentication
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Check protected routes
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check public only routes
  const isPublicOnlyRoute = publicOnlyRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Nếu là protected route và chưa đăng nhập -> redirect về home
  if (isProtectedRoute && !isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // Nếu là public only route và đã đăng nhập -> redirect về dashboard
  if (isPublicOnlyRoute && isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Config matcher - chỉ chạy middleware cho các route cần thiết
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};

