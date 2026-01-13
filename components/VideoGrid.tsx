"use client";

import { VideoWithUser } from "@/lib/db/schema";
import VideoCard from "./VideoCard";
import { Loader2 } from "lucide-react";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";

interface VideoGridProps {
  initialVideos: VideoWithUser[];
  loadMoreAction: (
    offset: number,
    limit: number
  ) => Promise<{ videos: VideoWithUser[]; hasMore: boolean }>;
  emptyMessage?: string;
  showVisibilityBadge?: boolean;
}

export default function VideoGrid({
  initialVideos,
  loadMoreAction,
  emptyMessage = "No videos found",
  showVisibilityBadge = false,
}: VideoGridProps) {
  const {
    data: videos,
    isLoading,
    hasMore,
    scrollTriggerRef,
  } = useInfiniteScroll({
    initialData: initialVideos,
    loadMoreAction,
    limit: 20,
  });

  // Empty state
  if (videos.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <>
      {/* Video Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 max-w-7xl mx-auto my-8">
        {videos.map((video) => (
          <VideoCard
            key={video.id}
            video={video}
            // showVisibilityBadge={showVisibilityBadge}
          />
        ))}
      </div>

      {/* Scroll Trigger & Loading Indicator */}
      {hasMore && (
        <div
          ref={scrollTriggerRef}
          className="flex justify-center py-8 min-h-[100px]"
        >
          {isLoading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Loading more videos...</span>
            </div>
          )}
        </div>
      )}

      {/* End of List Message */}
      {!hasMore && videos.length > 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">🎉 You&apos;ve reached the end!</p>
          <p className="text-xs mt-1">{videos.length} videos total</p>
        </div>
      )}
    </>
  );
}
