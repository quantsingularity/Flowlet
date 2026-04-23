import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFoundPage: React.FC = () => (
  <div className="flex min-h-screen items-center justify-center bg-mesh px-6">
    <div className="text-center animate-fade-in-up">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-secondary">
        <SearchX className="h-9 w-9 text-muted-foreground" />
      </div>
      <h1 className="text-4xl font-bold tracking-tight mb-2">404</h1>
      <p className="text-lg font-medium mb-1">Page not found</p>
      <p className="text-sm text-muted-foreground mb-8 max-w-sm mx-auto">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Button asChild className="bg-gradient-brand hover:opacity-90">
        <Link to="/dashboard">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
        </Link>
      </Button>
    </div>
  </div>
);

export default NotFoundPage;
