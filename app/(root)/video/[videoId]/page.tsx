import { Suspense } from 'react';
import { notFound, redirect } from 'next/navigation';
import { VideoService } from '@/lib/services/video-service';
import VideoPlayer from '@/components/VideoPlayer';
import VideoMetadata from '@/components/VideoMetadata';

interface VideoPageProps {
  params: Promise<{ videoId: string }>;
}

export default async function VideoPage({ params }: VideoPageProps) {

  // Get video ID from params
  const { videoId } = await params;

  // Fetch video with user information
  const video = await VideoService.getPublicVideoById(videoId);

  // Return 404 if video not found or user doesn't have access
  if (!video) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Suspense fallback={<VideoSkeleton />}>
        <div className="space-y-6">
          {/* Video Player */}
          <VideoPlayer
            videoUrl={video.videoUrl}
            thumbnailUrl={video.thumbnailUrl}
            title={video.title}
          />

          {/* Video Metadata */}
          <VideoMetadata video={video} />
        </div>
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

  const video = await VideoService.getPublicVideoById(videoId);

  if (!video) {
    return {
      title: 'Video Not Found',
    };
  }

  return {
    title: video.title,
    description: video.description || `Watch ${video.title}`,
    openGraph: {
      title: video.title,
      description: video.description || undefined,
      images: video.thumbnailUrl ? [video.thumbnailUrl] : [],
      type: 'video.other',
    },
  };
}