
import { ReactNode } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { LoadingSpinner } from "@/components/loading-spinner";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const [, navigate] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    navigate("/auth");
    return null;
  }

  return <>{children}</>;
}
