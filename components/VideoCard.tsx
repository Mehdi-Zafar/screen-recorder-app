"use client";

import React, { useState } from "react";
import {
  MoreVertical,
  Play,
  Download,
  Share,
  Trash2,
  Lock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { VideoWithUser } from "@/lib/db/schema";
import { formatDuration, timeAgo } from "@/lib/utils";
import Link from "next/link";
import { useVideoMutations } from "@/hooks/useVideoMutations";
import { useSession } from "@/lib/auth-client";
import Image from "next/image";
import { MenuAction } from "@/lib/constants";
import { toast } from "sonner";
import { handleShare } from "@/lib/helpers";

interface VideoCardProps {
  video: VideoWithUser;
  cardClass?: string;
  queryKey: string[];
}

export default function VideoCard({
  video,
  cardClass,
  queryKey,
}: VideoCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { data: session } = useSession();
  const { deleteMutation } = useVideoMutations({
    queryKey,
    redirectOnDelete: false, // Don't redirect from cards
  });
  const { title, thumbnailUrl, duration, views, createdAt, user } = video;
  const authorName = user?.name ?? "Jack";
  const authorAvatar = user?.image;
  const videoCreatedAt = timeAgo(createdAt);
  const durationFormatted = formatDuration(duration);
  const isOwner = user?.id === session?.user?.id;

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this video? This action cannot be undone.",
    );

    if (!confirmed) return;

    await deleteMutation.mutateAsync(video.id);
  };

  const handleDownload = () => {
    // ✅ Add ?download=1 to UploadThing URL
    const downloadUrl = `${video.videoUrl}${video.videoUrl.includes("?") ? "&" : "?"}download=1`;

    window.open(downloadUrl, "_blank");
    toast.success("Download started!");
  };

  const handleMenuAction = (action: MenuAction) => {
    switch (action) {
      case MenuAction.DOWNLOAD:
        handleDownload();
      case MenuAction.DELETE:
        handleDelete();
      case MenuAction.SHARE:
        handleShare(video);
    }
  };

  const handleVideoClick = () => {
    console.log(`Playing video: ${title}`);
    // Add your video play logic here
  };

  return (
    <Card
      className={`group overflow-hidden transition-all duration-200 hover:shadow-lg ${cardClass} pt-0`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-0">
        {/* Thumbnail Section */}
        <Link href={`/video/${video.id}`} prefetch={false}>
          <div className="relative aspect-video bg-gray-100 overflow-hidden">
            {thumbnailUrl ? (
              <div className="relative w-full h-full">
                <Image
                  src={thumbnailUrl}
                  alt={title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                  loading="lazy"
                  quality={75}
                />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                <Play className="w-16 h-16 text-primary/40" />
              </div>
            )}

            {/* Duration Badge */}
            <Badge
              variant="secondary"
              className="absolute bottom-2 right-2 bg-black/80 text-white hover:bg-black/80 text-xs px-2 py-1"
            >
              {durationFormatted}
            </Badge>

            {video.visibility === "private" && (
              <div className="absolute top-2 left-2 bg-black/80 text-white p-1.5 rounded-full z-10">
                <Lock className="w-3.5 h-3.5" />
              </div>
            )}

            {/* Play Button Overlay */}
            <div
              className={`absolute inset-0 bg-black/20 flex items-center justify-center transition-opacity duration-200 cursor-pointer ${
                isHovered ? "opacity-100" : "opacity-0"
              }`}
              onClick={handleVideoClick}
            >
              <Button
                size="icon"
                className="h-12 w-12 rounded-full bg-white/90 text-black hover:bg-white"
              >
                <Play className="h-5 w-5 ml-1" fill="currentColor" />
              </Button>
            </div>
          </div>
        </Link>

        {/* Video Info Section */}
        <div className="p-4">
          <div className="flex items-start space-x-3">
            {/* Author Avatar */}
            <div className="flex-shrink-0 pt-1">
              <Avatar className="h-9 w-9">
                <AvatarImage src={authorAvatar} alt={authorName} />
                <AvatarFallback className="text-sm">
                  {authorName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Title and Author Info */}
            <div className="flex-1 min-w-0">
              <h3
                className="font-semibold text-sm leading-5 text-gray-900 line-clamp-2 mb-2 cursor-pointer hover:text-blue-600 transition-colors inline"
                onClick={handleVideoClick}
                title={title}
              >
                {title}
              </h3>

              <div className="text-xs text-gray-500 space-y-1">
                <p className="font-medium text-gray-700">{authorName}</p>
                <div className="flex items-center space-x-1">
                  <span>
                    {views} {views === 1 ? "view" : "views"}
                  </span>
                  <span>•</span>
                  <span>{videoCreatedAt}</span>
                </div>
              </div>
            </div>

            {/* Options Menu */}
            <div className="flex-shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-48">
                  {/* <DropdownMenuItem onClick={() => handleMenuAction("play")}>
                    <Play className="mr-2 h-4 w-4" />
                    Watch Now
                  </DropdownMenuItem> */}

                  <DropdownMenuItem
                    onClick={() => handleMenuAction(MenuAction.DOWNLOAD)}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </DropdownMenuItem>

                  {video.visibility === "public" && (
                    <DropdownMenuItem
                      onClick={() => handleMenuAction(MenuAction.SHARE)}
                    >
                      <Share className="mr-2 h-4 w-4" />
                      Share
                    </DropdownMenuItem>
                  )}
                  {isOwner && (
                    <>
                      <DropdownMenuSeparator />

                      <DropdownMenuItem
                        onClick={() => handleMenuAction(MenuAction.DELETE)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
