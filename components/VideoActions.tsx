"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { VideoWithUser } from "@/lib/db/schema";
import Link from "next/link";
import { useVideoMutations } from "@/hooks/useVideoMutations";
import { QueryKey } from "@/lib/constants";

interface VideoActionsProps {
  video: VideoWithUser;
}

export default function VideoActions({ video }: VideoActionsProps) {
  const { visibilityMutation, deleteMutation } = useVideoMutations({
    queryKey: [QueryKey.VIDEOS, QueryKey.PUBLIC],
    redirectOnDelete: true,
    redirectPath: "/",
  });

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this video? This action cannot be undone.",
      )
    ) {
      return;
    }

    await deleteMutation.mutateAsync(video.id);
  };

  const toggleVisibility = async () => {
    const newVisibility = video.visibility === "public" ? "private" : "public";

    await visibilityMutation.mutateAsync({
      videoId: video.id,
      visibility: newVisibility,
    });
  };

  return (
    <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-lg border border-border">
      <div className="flex-1">
        <p className="text-sm font-medium text-foreground">Video Management</p>
        <p className="text-xs text-muted-foreground">
          You own this video •{" "}
          {video.visibility === "public"
            ? "Visible to everyone"
            : "Only visible to you"}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href={`/video/${video.id}/edit`}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Link>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={toggleVisibility}
              className="cursor-pointer"
            >
              {video.visibility === "public" ? (
                <span className="flex items-center">
                  <EyeOff className="w-4 h-4 mr-2" />
                  Make Private
                </span>
              ) : (
                <span className="flex items-center">
                  <Eye className="w-4 h-4 mr-2" />
                  Make Public
                </span>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="text-destructive focus:text-destructive cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              {deleteMutation.isPending ? "Deleting..." : "Delete Video"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
