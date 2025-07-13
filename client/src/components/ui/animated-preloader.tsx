import React from 'react';
import Lottie from 'lottie-react';
import animationData from '@assets/Animation - 1716380534233_1752386084771.json';

interface AnimatedPreloaderProps {
  message?: string;
  className?: string;
}

export function AnimatedPreloader({ 
  message = "Preparando sua viagem...", 
  className = "" 
}: AnimatedPreloaderProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
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

export default AnimatedPreloader;