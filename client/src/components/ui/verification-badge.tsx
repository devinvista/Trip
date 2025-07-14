import { Shield, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface VerificationBadgeProps {
  isVerified: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function VerificationBadge({ isVerified, size = "md", className }: VerificationBadgeProps) {
  // Debug log
  console.log("VerificationBadge render:", { isVerified, size });
  
  if (!isVerified) {
    console.log("Badge not shown - isVerified is false");
    return null;
  }

  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4", 
    lg: "h-5 w-5"
  };

  console.log("Badge will be shown - isVerified is true");

  return (
    <div className={cn(
      "absolute -top-1 -right-1 bg-blue-500 rounded-full p-0.5 shadow-sm border-2 border-white",
      className
    )}>
      <CheckCircle className={cn("text-white", sizeClasses[size])} />
    </div>
  );
}