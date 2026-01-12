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
import { useState } from "react";
import { toast } from "sonner";

interface VideoActionsProps {
  video: VideoWithUser;
}

export default function VideoActions({ video }: VideoActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this video? This action cannot be undone."
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      // TODO: Implement delete action
      toast.success("Video deleted successfully");
    } catch (error) {
      toast.error("Failed to delete video");
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleVisibility = async () => {
    try {
      // TODO: Implement visibility toggle
      const newVisibility =
        video.visibility === "public" ? "private" : "public";
      toast.success(`Video set to ${newVisibility}`);
    } catch (error) {
      toast.error("Failed to update visibility");
    }
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
            <DropdownMenuItem onClick={toggleVisibility}>
              {video.visibility === "public" ? (
                <>
                  <EyeOff className="w-4 h-4 mr-2" />
                  Make Private
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  Make Public
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {isDeleting ? "Deleting..." : "Delete Video"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
