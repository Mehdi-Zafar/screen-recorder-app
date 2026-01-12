"use client";

import { VideoWithUser } from "@/lib/db/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Share2, Eye, Calendar, Globe, Lock } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import VideoActions from "./VideoActions";
import { getUserInitials } from "@/lib/helpers";

interface VideoMetadataProps {
  video: VideoWithUser;
  showVisibility?: boolean; // Only show for owners
}

export default function VideoMetadata({
  video,
  showVisibility = false,
}: VideoMetadataProps) {
  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/video/${video.id}`;

    try {
      if (navigator.share && video.visibility === "public") {
        await navigator.share({
          title: video.title,
          text: video.description || undefined,
          url: shareUrl,
        });
        toast.success("Shared successfully!");
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied to clipboard!");
      }
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        toast.error("Failed to share video");
      }
    }
  };

  const formatDuration = (seconds: number | null): string => {
    if (!seconds) return "Unknown duration";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      {/* Video Title */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">{video.title}</h1>

        {/* Video Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            <span>{video.views.toLocaleString()} views</span>
          </div>

          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>
              {formatDistanceToNow(new Date(video.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>

          {video.duration && (
            <div className="flex items-center gap-1">
              <span>Duration: {formatDuration(video.duration)}</span>
            </div>
          )}

          {showVisibility && (
            <div className="flex items-center gap-1">
              {video.visibility === "public" ? (
                <>
                  <Globe className="w-4 h-4" />
                  <span>Public</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Private</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* User Info & Actions */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* User Info */}
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage
              src={video?.user?.image || undefined}
              alt={video?.user?.name}
            />
            <AvatarFallback>{getUserInitials(video?.user?.name)}</AvatarFallback>
          </Avatar>

          <div>
            <p className="font-semibold text-foreground">{video.user.name}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="gap-2"
          >
            <Share2 className="w-4 h-4" />
            Share
          </Button>
        </div>
      </div>

      {showVisibility && <VideoActions video={video} />}

      {/* Divider */}
      <hr className="border-border" />

      {/* Description */}
      {video.description && (
        <div className="space-y-2">
          <h2 className="font-semibold text-foreground">Description</h2>
          <p className="text-muted-foreground whitespace-pre-wrap">
            {video.description}
          </p>
        </div>
      )}
    </div>
  );
}
