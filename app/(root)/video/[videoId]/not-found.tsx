import { Button } from "@/components/ui/button";
import { VideoOff } from "lucide-react";
import Link from "next/link";

export default function VideoNotFound() {
  const message =
    "The video you're looking for doesn't exist or you don't have permission to view it.";
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <VideoOff className="w-16 h-16 text-muted-foreground" />
        <h2 className="text-2xl font-bold text-foreground">Video Not Found</h2>
        <p className="text-muted-foreground text-center max-w-md">{message}</p>
        <Button asChild>
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
