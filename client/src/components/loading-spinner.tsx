import { Loader2, Plane, Globe } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  variant?: "simple" | "travel";
}

export function LoadingSpinner({ size = "md", className = "", variant = "simple" }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12"
  };

  if (variant === "travel") {
    return (
      <div className={`flex flex-col items-center justify-center ${className}`}>
        {/* Globo e Avião Animados */}
        <div className="relative">
          {/* Globo Central */}
          <div className="relative w-20 h-20 mb-6">
            {/* Fundo do globo com gradiente */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full animate-pulse shadow-lg"></div>
            
            {/* Continentes simplificados */}
            <div className="absolute inset-2 bg-gradient-to-br from-green-400 to-green-600 rounded-full opacity-70"></div>
            <div className="absolute top-3 left-3 w-3 h-3 bg-green-500 rounded-full opacity-80"></div>
            <div className="absolute bottom-4 right-4 w-2 h-2 bg-green-500 rounded-full opacity-80"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-green-500 rounded-full opacity-60"></div>
            
            {/* Linha orbital 1 */}
            <div className="absolute inset-0 border-2 border-blue-200 rounded-full animate-ping opacity-30"></div>
            
            {/* Linha orbital 2 */}
            <div className="absolute inset-2 border-2 border-indigo-200 rounded-full animate-ping opacity-20" style={{ animationDelay: '0.5s' }}></div>
            
            {/* Avião principal circulando */}
            <div className="absolute inset-0 animate-spin" style={{ animationDuration: '4s' }}>
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Plane className="w-5 h-5 text-indigo-600 rotate-90 drop-shadow-lg" />
              </div>
            </div>
            
            {/* Segundo avião circulando em direção oposta */}
            <div className="absolute inset-0 animate-spin" style={{ animationDuration: '6s', animationDirection: 'reverse' }}>
              <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
                <Plane className="w-4 h-4 text-blue-500 -rotate-90 drop-shadow-lg" />
              </div>
            </div>
            
            {/* Efeito de brilho */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white to-transparent opacity-20 rounded-full animate-pulse"></div>
          </div>
          
          {/* Texto de carregamento */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
              <span>Preparando sua viagem</span>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader2 className={`animate-spin text-primary ${sizeClasses[size]}`} />
    </div>
  );
}