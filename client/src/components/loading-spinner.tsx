import { Loader2 } from "lucide-react";
import Lottie from 'lottie-react';
import animationData from '@assets/Animation - 1716380534233_1752386084771.json';

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  variant?: "simple" | "travel";
  message?: string;
}

export function LoadingSpinner({ size = "md", className = "", variant = "simple", message = "Preparando sua viagem..." }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12"
  };

  if (variant === "travel") {
    return (
      <div className={`flex flex-col items-center justify-center ${className}`}>
        <div className="w-48 h-48 mb-4">
          <Lottie 
            animationData={animationData}
            loop={true}
            autoplay={true}
            style={{ width: '100%', height: '100%' }}
          />
        </div>
        {message && (
          <p className="text-lg font-medium text-slate-600 dark:text-slate-400 text-center animate-pulse">
            {message}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader2 className={`animate-spin text-primary ${sizeClasses[size]}`} />
    </div>
  );
}