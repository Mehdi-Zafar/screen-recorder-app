import { Suspense } from "react";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import VideoGrid from "@/components/VideoGrid";
import { VideoService } from "@/lib/services/video-service";
import { searchUserVideos } from "@/lib/actions/video.actions";
import { auth } from "@/lib/auth";
import Header from "@/components/Header";
import { Loader2 } from "lucide-react";
import { QueryKey } from "@/lib/constants";
import { Filters } from "@/lib/types/video";

export const metadata = {
  title: "My Videos",
  description: "Manage your videos",
};

interface ProfileVideosPageProps {
  searchParams: Promise<{
    q?: string;
    dateRange?: string;
    duration?: string;
    visibility?: string;
    sortBy?: string;
  }>;
}

const PAGE_SIZE = 6;

export default async function ProfileVideosPage({
  searchParams,
}: ProfileVideosPageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  const params = await searchParams;
  const searchQuery = params.q || "";
  const sortBy = params.sortBy || "latest";

  const filters = {
    dateRange: params.dateRange?.split(",").filter(Boolean) || [],
    duration: params.duration?.split(",").filter(Boolean) || [],
    visibility: params.visibility?.split(",").filter(Boolean) || [],
  };

  return (
    <div className="container mx-auto px-4 max-w-7xl">
      <Suspense fallback={<ProfileVideosLoading />}>
        <ProfileVideosContent
          searchQuery={searchQuery}
          filters={filters}
          sortBy={sortBy}
          userId={session.user.id}
        />
      </Suspense>
    </div>
  );
}

async function ProfileVideosContent({
  searchQuery,
  filters,
  sortBy,
  userId,
}: {
  searchQuery: string;
  filters: Filters;
  sortBy: string;
  userId: string;
}) {
  // ✅ Server-side fetch for initial data
  const initialVideos = searchQuery.trim()
    ? await VideoService.searchUserVideosWithFilters(
        userId,
        searchQuery,
        filters,
        sortBy,
        PAGE_SIZE,
        0,
      )
    : await VideoService.getUserVideosWithFilters(
        userId,
        filters,
        sortBy,
        PAGE_SIZE,
        0,
      );

  return (
    <>
      <Header
        title="My Videos"
        subtitle="Manage your uploaded videos"
        placeholder="Search your videos..."
        initialSearchValue={searchQuery}
      />

      <div className="py-8">
        {/* ✅ Same VideoGrid component, different cache key */}
        <VideoGrid
          initialVideos={initialVideos}
          searchAction={searchUserVideos}
          queryKey={[
            QueryKey.VIDEOS,
            QueryKey.USER,
            searchQuery,
            JSON.stringify(filters),
            sortBy,
          ]}
          searchQuery={searchQuery}
          filters={filters}
          sortBy={sortBy}
          emptyMessage={
            searchQuery
              ? `No videos found for "${searchQuery}"`
              : "You haven't uploaded any videos yet"
          }
          pageSize={PAGE_SIZE}
        />
      </div>
    </>
  );
}

function ProfileVideosLoading() {
  return (
    <div className="flex justify-center items-center py-20">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}
