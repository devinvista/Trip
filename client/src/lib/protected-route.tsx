
import { ReactNode } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth-snake";
import { LoadingSpinner } from "@/components/loading-spinner";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, is_loading } = useAuth();
  const [, navigate] = useLocation();

  if (is_loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner variant="travel" size="lg" message="Verificando autenticação..." />
      </div>
    );
  }

  if (!user) {
    navigate("/auth");
    return null;
  }

  return <>{children}</>;
}
