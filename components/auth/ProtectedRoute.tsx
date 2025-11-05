/**
 * ProtectedRoute - Component bảo vệ các route yêu cầu authentication
 */

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/auth/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  requireAuth?: boolean;
}

/**
 * Component wrapper để bảo vệ các trang cần đăng nhập
 * @param children - Nội dung trang được bảo vệ
 * @param redirectTo - Đường dẫn redirect khi chưa đăng nhập (mặc định: "/")
 * @param requireAuth - Có yêu cầu authentication không (mặc định: true)
 */
export const ProtectedRoute = ({
  children,
  redirectTo = "/",
  requireAuth = true,
}: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Chờ loading xong
    if (isLoading) return;

    // Nếu yêu cầu auth nhưng chưa đăng nhập -> redirect
    if (requireAuth && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, requireAuth, redirectTo, router]);

  // Hiển thị loading khi đang check auth
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
          <p className="text-sm text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  // Nếu yêu cầu auth nhưng chưa đăng nhập -> không render
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  // Render children nếu đã authenticated hoặc không yêu cầu auth
  return <>{children}</>;
};

