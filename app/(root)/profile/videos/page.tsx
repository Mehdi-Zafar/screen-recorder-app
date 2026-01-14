import { Suspense } from "react";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import VideoGrid from "@/components/VideoGrid";
import { VideoService } from "@/lib/services/video-service";
import { searchUserVideos } from "@/lib/actions/video.actions";
import { auth } from "@/lib/auth";
import Header from "@/components/Header";
import { Loader2 } from "lucide-react";

export const metadata = {
  title: "My Videos",
  description: "Manage your videos",
};

interface ProfileVideosPageProps {
  searchParams: Promise<{
    q?: string;
  }>;
}

const pageSize = 6;

export default async function ProfileVideosPage({
  searchParams,
}: ProfileVideosPageProps) {
  const params = await searchParams;
  const searchQuery = params.q || "";

  return (
    <div className="container mx-auto px-4 max-w-7xl">
      <Suspense fallback={<ProfileVideosLoading />}>
        <ProfileVideosContent searchQuery={searchQuery} />
      </Suspense>
    </div>
  );
}

async function ProfileVideosContent({ searchQuery }: { searchQuery: string }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  // ✅ Server-side fetch for initial data
  const initialVideos = searchQuery.trim()
    ? await VideoService.searchUserVideos(session.user.id, searchQuery, pageSize, 0)
    : await VideoService.getUserVideos(session.user.id, pageSize, 0);

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
          queryKey={["videos", "user"]} // Different cache key
          searchQuery={searchQuery}
          emptyMessage={
            searchQuery
              ? `No videos found for "${searchQuery}"`
              : "You haven't uploaded any videos yet"
          }
          pageSize={pageSize}
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
