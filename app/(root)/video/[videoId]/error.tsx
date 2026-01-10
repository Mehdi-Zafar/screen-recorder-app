"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function VideoError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to error reporting service
    console.error("Video page error:", error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <AlertCircle className="w-16 h-16 text-destructive" />
        <h2 className="text-2xl font-bold text-foreground">
          Something went wrong!
        </h2>
        <p className="text-muted-foreground text-center max-w-md">
          We encountered an error while loading this video. This could be due to
          a network issue or the video may no longer be available.
        </p>
        <div className="flex gap-2">
          <Button onClick={reset} variant="default">
            Try Again
          </Button>
          <Button onClick={() => window.history.back()} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
