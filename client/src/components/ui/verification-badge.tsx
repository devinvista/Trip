import { Shield, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface VerificationBadgeProps {
  isVerified: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function VerificationBadge({ isVerified, size = "md", className }: VerificationBadgeProps) {
  if (!isVerified) return null;

  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4", 
    lg: "h-5 w-5"
  };

  const badgeSize = {
    sm: "h-4 w-4 p-0.5",
    md: "h-5 w-5 p-0.5", 
    lg: "h-6 w-6 p-1"
  };

  const positioning = {
    sm: "-top-0.5 -right-0.5",
    md: "-top-1 -right-1",
    lg: "-top-1.5 -right-1.5"
  };

  return (
    <div className={cn(
      "absolute bg-gradient-to-br from-green-400 to-emerald-500 rounded-full shadow-lg border-2 border-white ring-1 ring-green-200/50 flex items-center justify-center",
      badgeSize[size],
      positioning[size],
      className
    )}>
      <CheckCircle className={cn("text-white drop-shadow-sm", sizeClasses[size])} />
    </div>
  );
}