import RootLayout from "@/components/RootLayout";
import useAuth from "@/hooks/useAuth";
import type { ReactNode } from "react";
import { useLocation, Navigate } from "react-router-dom";

export default function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated, userInfo } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <RootLayout>{children}</RootLayout>;
}
