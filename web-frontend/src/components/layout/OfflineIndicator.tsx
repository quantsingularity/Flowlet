import { WifiOff } from "lucide-react";
import type React from "react";

const OfflineIndicator: React.FC = () => {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-2 bg-destructive/90 backdrop-blur-sm text-destructive-foreground py-2 px-4 text-sm font-medium">
      <WifiOff className="h-3.5 w-3.5 shrink-0" />
      <span>You're offline — some features may not be available.</span>
    </div>
  );
};

export default OfflineIndicator;
