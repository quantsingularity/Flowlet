import React from "react";

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = "Loading Flowlet...",
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-5">
        <div className="relative mx-auto w-14 h-14">
          <div className="absolute inset-0 rounded-2xl bg-primary/10" />
          <div className="absolute inset-0 rounded-2xl border-2 border-transparent border-t-primary animate-spin" />
          <div className="absolute inset-2 rounded-xl bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">F</span>
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">{message}</p>
          <p className="text-xs text-muted-foreground animate-pulse">
            Please wait a moment...
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
