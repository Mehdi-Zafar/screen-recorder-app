import { Suspense } from "react";
import VideoGrid from "@/components/VideoGrid";
import { VideoService } from "@/lib/services/video-service";
import { searchPublicVideos } from "@/lib/actions/video.actions";
import Header from "@/components/Header";

export const metadata = {
  title: "Video Library",
  description: "Browse public videos",
};

interface LibraryPageProps {
  searchParams: Promise<{
    q?: string;
  }>;
}

const pageSize = 6;

export default async function LibraryPage({ searchParams }: LibraryPageProps) {
  const params = await searchParams;
  const searchQuery = params.q || "";

  return (
    <div className="container mx-auto px-4 max-w-7xl">
      <Suspense fallback={<LibraryLoading />}>
        <LibraryContent searchQuery={searchQuery} />
      </Suspense>
    </div>
  );
}

async function LibraryContent({ searchQuery }: { searchQuery: string }) {
  // ✅ Server-side fetch for initial data
  const initialVideos = searchQuery.trim()
    ? await VideoService.searchPublicVideos(searchQuery, pageSize, 0)
    : await VideoService.getPublicVideos(pageSize, 0);

  return (
    <>
      <Header
        title="Video Library"
        subtitle="Discover amazing screen recordings from our community."
        placeholder="Search videos by title, description, or creator..."
        initialSearchValue={searchQuery}
      />

      <div className="py-8">
        {/* ✅ Reusable VideoGrid with TanStack Query */}
        <VideoGrid
          initialVideos={initialVideos}
          searchAction={searchPublicVideos}
          queryKey={["videos", "public",searchQuery]} // Unique cache key
          searchQuery={searchQuery}
          emptyMessage={
            searchQuery
              ? `No videos found for "${searchQuery}"`
              : "No public videos available yet"
          }
          pageSize={pageSize}
        />
      </div>
    </>
  );
}

function LibraryLoading() {
  return (
    <div className="py-8">
      <div className="mb-8 space-y-4">
        <div className="h-12 bg-muted rounded animate-pulse" />
        <div className="h-10 bg-muted rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-3 animate-pulse">
            <div className="aspect-video bg-muted rounded-lg" />
            <div className="space-y-2">
              <div className="h-5 bg-muted rounded w-full" />
              <div className="h-4 bg-muted rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
