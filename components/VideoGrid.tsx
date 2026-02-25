"use client";

import { VideoWithUser } from "@/lib/db/schema";
import VideoCard from "./VideoCard";
import { Loader2 } from "lucide-react";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Filters } from "@/lib/types/video";

interface VideoGridProps {
  initialVideos: VideoWithUser[];
  searchAction: (
    searchQuery: string,
    offset: number,
    limit: number,
    filters?: Filters,
    sortBy?: string,
  ) => Promise<{ videos: VideoWithUser[]; hasMore: boolean }>;
  queryKey: string[];
  searchQuery?: string;
  emptyMessage?: string;
  pageSize?: number;
  filters?: Filters;
  sortBy?: string;
}

export default function VideoGrid({
  initialVideos,
  searchAction,
  queryKey,
  searchQuery = "",
  emptyMessage = "No videos found",
  pageSize = 10,
  filters,
  sortBy,
}: VideoGridProps) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isFetching,
    isError,
  } = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam }) => {
      return await searchAction(
        searchQuery,
        pageParam,
        pageSize,
        filters,
        sortBy,
      );
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.hasMore) return undefined;
      return allPages.length * pageSize;
    },
    // ✅ initialData with timestamp prevents React Query from immediately refetching
    // server-provided data that is already fresh
    initialData:
      initialVideos.length > 0
        ? {
            pages: [
              {
                videos: initialVideos,
                hasMore: initialVideos.length >= pageSize,
              },
            ],
            pageParams: [0],
          }
        : undefined,
    initialDataUpdatedAt: Date.now(), // ✅ Tells RQ this data is fresh right now
    staleTime: 30 * 1000, // ✅ 30s — won't refetch unless queryKey changes
    // ✅ When queryKey changes (new search/filter), keep showing old results
    // while new ones load instead of a blank flash
    placeholderData: (previousData) => previousData,
  });

  const { ref, inView } = useInView({ threshold: 0.1 });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allVideos = data?.pages.flatMap((page) => page.videos) ?? [];

  // ✅ isLoading = true only on first load with no initialData
  if (isLoading) {
    return <VideoGridSkeleton />;
  }

  if (isError) {
    return (
      <div className="text-center py-20 text-red-500">
        <p>Failed to load videos. Please try again.</p>
      </div>
    );
  }

  if (allVideos.length === 0 && !isFetching) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground text-lg">{emptyMessage}</p>
        {searchQuery && (
          <p className="text-sm text-muted-foreground mt-2">
            Try a different search term
          </p>
        )}
      </div>
    );
  }

  return (
    <>
      {/* ✅ isFetching covers both new search and background refetch */}
      {isFetching && !isFetchingNextPage && (
        <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Loading...</span>
        </div>
      )}

      {searchQuery && !isFetching && (
        <div className="mb-4 text-sm text-muted-foreground">
          Showing results for &quot;{searchQuery}&quot; ({allVideos.length}{" "}
          videos)
        </div>
      )}

      {/* ✅ Fade while fetching new results, keep old ones visible */}
      <div
        className={
          isFetching && !isFetchingNextPage
            ? "opacity-50 transition-opacity duration-200 pointer-events-none"
            : ""
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          {allVideos.map((video) => (
            <VideoCard key={video.id} video={video} queryKey={[...queryKey]} />
          ))}
        </div>
      </div>

      {hasNextPage && (
        <div ref={ref} className="py-8">
          {isFetchingNextPage && <VideoGridSkeleton />}
        </div>
      )}

      {!hasNextPage && allVideos.length > 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">
            {searchQuery
              ? `That's all the results for "${searchQuery}"`
              : "🎉 You've reached the end!"}
          </p>
        </div>
      )}
    </>
  );
}

function VideoGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="space-y-3 animate-pulse">
          <div className="aspect-video bg-muted rounded-lg" />
          <div className="space-y-2 p-2">
            <div className="h-5 bg-muted rounded w-full" />
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="flex items-center gap-2 mt-2">
              <div className="h-8 w-8 bg-muted rounded-full" />
              <div className="h-4 bg-muted rounded w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
