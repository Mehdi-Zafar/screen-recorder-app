"use client";

import { VideoWithUser } from "@/lib/db/schema";
import VideoCard from "./VideoCard";
import { Loader2 } from "lucide-react";
import { useInView } from "react-intersection-observer";
import { useEffect, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Filters } from "@/lib/types/video";

interface VideoGridProps {
  initialVideos: VideoWithUser[];
  searchAction: (
    searchQuery: string,
    offset: number,
    limit: number,
    filters?:Filters,
    sortBy?:string
  ) => Promise<{ videos: VideoWithUser[]; hasMore: boolean }>;
  queryKey: string[];
  searchQuery?: string;
  emptyMessage?: string;
  pageSize?: number;
  filters?:Filters;
  sortBy?:string;
}

export default function VideoGrid({
  initialVideos,
  searchAction,
  queryKey,
  searchQuery = "",
  emptyMessage = "No videos found",
  pageSize = 10,
  filters,
  sortBy
}: VideoGridProps) {
  // ✅ Track if we've rendered this search query before
  const hasRenderedSearchQuery = useRef<string | null>(null);

  // ✅ Check if this is a NEW search (different from what we initially rendered)
  const isNewSearch =
    hasRenderedSearchQuery.current !== null &&
    hasRenderedSearchQuery.current !== searchQuery;

  // ✅ Only use initialData if this is the FIRST render (server-provided data)
  const shouldUseInitialData = hasRenderedSearchQuery.current === null;

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
      return await searchAction(searchQuery, pageParam, pageSize,filters,sortBy);
    },

    initialPageParam: 0,

    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.hasMore) return undefined;
      return allPages.length * pageSize;
    },

    // ✅ Only use initialData on first render
    initialData:
      shouldUseInitialData && initialVideos.length > 0
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

    staleTime: 5 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });

  const { ref, inView } = useInView({
    threshold: 0.1,
  });

  // ✅ Mark that we've rendered this search query
  useEffect(() => {
    hasRenderedSearchQuery.current = searchQuery;
  }, [searchQuery]);

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allVideos = data?.pages.flatMap((page) => page.videos) || [];

  // ✅ Show skeleton when:
  // 1. Initial load with no data
  // 2. New search is being performed
  if (isLoading || (isNewSearch && isFetching && allVideos.length === 0)) {
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
      {/* ✅ Show subtle loading during new search with existing results */}
      {isNewSearch && isFetching && allVideos.length > 0 && (
        <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Searching...</span>
        </div>
      )}

      {searchQuery && !isFetching && (
        <div className="mb-4 text-sm text-muted-foreground">
          Showing results for {'"'}
          {searchQuery}
          {'"'} ({allVideos.length} videos)
        </div>
      )}

      {/* ✅ Fade during new search */}
      <div
        className={
          isNewSearch && isFetching
            ? "opacity-50 transition-opacity duration-200 pointer-events-none"
            : ""
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 xxl:grid-cols-4 gap-6">
          {allVideos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              queryKey={[...queryKey]}
              // showVisibilityBadge={showVisibilityBadge}
            />
          ))}
        </div>
      </div>

      {hasNextPage && (
        <div ref={ref} className="py-8">
          {isFetchingNextPage && <VideoGridSkeleton />}
        </div>
      )}

      {!hasNextPage && (
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 xxl:grid-cols-4 gap-6">
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
