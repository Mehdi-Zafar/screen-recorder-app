import { Suspense } from "react";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { VideoService } from "@/lib/services/video-service";
import VideoPlayer from "@/components/VideoPlayer";
import VideoMetadata from "@/components/VideoMetadata";
// import SignUpBanner from '@/components/SignUpBanner';
import VideoActions from "@/components/VideoActions";
// import SignUpCallToAction from '@/components/video/SignUpCallToAction';

interface VideoPageProps {
  params: Promise<{ videoId: string }>;
}

async function VideoContent({ videoId }: { videoId: string }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Fetch video using service method with smart access control
  const video = await VideoService.getAuthorizedVideoById(videoId, session?.user?.id);

  // If video not found or user doesn't have access
  if (!video) {
    notFound();
  }

  // Determine context
  const isOwner = session?.user?.id === video.userId;
  const isPublic = video.visibility === "public";
  const isAuthenticated = !!session?.user;

  return (
    <div className="space-y-6">
      {/* Sign Up Banner - Show for public videos when user is not logged in */}
      {isPublic && !isAuthenticated && (
        // <SignUpBanner />
        <></>
      )}

      {/* Video Player */}
      <VideoPlayer
        video={video}
        isOwner={isOwner}
      />


      {/* Video Metadata */}
      <VideoMetadata video={video} showVisibility={isOwner} />

      {/* Call to Action - Show for public videos when user is not logged in */}
      {isPublic && !isAuthenticated && (
        // <SignUpCallToAction />
        <></>
      )}
    </div>
  );
}

export default async function VideoPage({ params }: VideoPageProps) {
  const { videoId } = await params;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Suspense fallback={<VideoSkeleton />}>
        <VideoContent videoId={videoId} />
      </Suspense>
    </div>
  );
}

function VideoSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="w-full aspect-video bg-muted rounded-lg" />
      <div className="space-y-3">
        <div className="h-8 bg-muted rounded w-3/4" />
        <div className="h-4 bg-muted rounded w-1/2" />
        <div className="h-20 bg-muted rounded" />
      </div>
    </div>
  );
}

// Generate metadata for SEO
export async function generateMetadata({ params }: VideoPageProps) {
  const { videoId } = await params;

  // Use the public method for metadata to avoid auth checks
  const video = await VideoService.getPublicVideoById(videoId);

  if (!video) {
    return {
      title: "Video Not Found",
    };
  }

  // Rich metadata for public videos (better SEO)
  return {
    title: video.title,
    description: video.description || `Watch ${video.title}`,
    openGraph: {
      title: video.title,
      description: video.description || undefined,
      images: video.thumbnailUrl ? [video.thumbnailUrl] : [],
      type: "video.other",
    },
    twitter: {
      card: "player",
      title: video.title,
      description: video.description || undefined,
      images: video.thumbnailUrl ? [video.thumbnailUrl] : [],
    },
  };
}
