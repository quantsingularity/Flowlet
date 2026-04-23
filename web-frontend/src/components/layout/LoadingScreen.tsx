import React from "react";

const LoadingScreen: React.FC = () => (
  <div className="flex min-h-screen items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-5 animate-fade-in">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-brand shadow-lg">
        <span className="text-2xl font-extrabold text-white">F</span>
      </div>
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-2 w-2 rounded-full bg-primary/50"
            style={{ animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }}
          />
        ))}
      </div>
      <p className="text-sm text-muted-foreground">Loading Flowlet…</p>
    </div>
  </div>
);

export default LoadingScreen;
