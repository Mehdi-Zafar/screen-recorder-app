"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import type { VideoWithUser } from "@/lib/db/schema";
import { VideoService } from "../services/video-service";
import { revalidatePath } from "next/cache";

/**
 * Search public videos with infinite scroll
 */
export async function searchPublicVideos(
  searchQuery: string,
  offset: number,
  limit: number = 20,
): Promise<{ videos: VideoWithUser[]; hasMore: boolean }> {
  try {
    const videos = searchQuery.trim()
      ? await VideoService.searchPublicVideos(searchQuery, limit + 1, offset)
      : await VideoService.getPublicVideos(limit + 1, offset);

    const hasMore = videos.length > limit;
    const videosToReturn = hasMore ? videos.slice(0, limit) : videos;

    return { videos: videosToReturn, hasMore };
  } catch (error) {
    console.error("❌ Error searching videos:", error);
    return { videos: [], hasMore: false };
  }
}

/**
 * Load more public videos for infinite scroll
 * @param offset - Number of videos already loaded
 * @param limit - Number of videos to fetch
 * @returns Object with videos array and hasMore boolean
 */
export async function loadMorePublicVideos(
  offset: number,
  limit: number = 20,
): Promise<{ videos: VideoWithUser[]; hasMore: boolean }> {
  try {
    // Fetch limit + 1 to determine if there are more videos
    const videos = await VideoService.getPublicVideos(limit + 1, offset);

    // If we got more than limit, there are more videos available
    const hasMore = videos.length > limit;

    // Return only the requested amount
    const videosToReturn = hasMore ? videos.slice(0, limit) : videos;

    return {
      videos: videosToReturn,
      hasMore,
    };
  } catch (error) {
    console.error("❌ Server Action: Error loading videos:", error);
    return {
      videos: [],
      hasMore: false,
    };
  }
}

/**
 * Search user videos with infinite scroll
 */
export async function searchUserVideos(
  searchQuery: string,
  offset: number,
  limit: number = 20,
): Promise<{ videos: VideoWithUser[]; hasMore: boolean }> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { videos: [], hasMore: false };
  }

  try {
    const videos = searchQuery.trim()
      ? await VideoService.searchUserVideos(
          session.user.id,
          searchQuery,
          limit + 1,
          offset,
        )
      : await VideoService.getUserVideos(session.user.id, limit + 1, offset);

    const hasMore = videos.length > limit;
    const videosToReturn = hasMore ? videos.slice(0, limit) : videos;

    return { videos: videosToReturn, hasMore };
  } catch (error) {
    console.error("❌ Error searching videos:", error);
    return { videos: [], hasMore: false };
  }
}

/**
 * Load more user videos for infinite scroll
 * @param offset - Number of videos already loaded
 * @param limit - Number of videos to fetch
 * @returns Object with videos array and hasMore boolean
 */
// export async function loadMoreUserVideos(
//   offset: number,
//   limit: number = 20
// ): Promise<{ videos: VideoWithUser[]; hasMore: boolean }> {
//   const session = await auth.api.getSession({
//     headers: await headers()
//   });

//   if (!session?.user) {
//     return { videos: [], hasMore: false };
//   }

//   try {
//     const videos = await VideoService.getUserVideos(session.user.id, limit + 1, offset);

//     const hasMore = videos.length > limit;
//     const videosToReturn = hasMore ? videos.slice(0, limit) : videos;

//     return {
//       videos: videosToReturn,
//       hasMore,
//     };
//   } catch (error) {
//     console.error('❌ Server Action: Error loading videos:', error);
//     return {
//       videos: [],
//       hasMore: false,
//     };
//   }
// }

/**
 * Update video visibility (public/private)
 */
export async function updateVideoVisibility(
  videoId: string,
  visibility: "public" | "private",
): Promise<{
  success: boolean;
  error?: string;
  message?: string;
  video?: VideoWithUser;
}> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    // Validate visibility
    if (!["public", "private"].includes(visibility)) {
      return { success: false, error: "Invalid visibility value" };
    }

    // Update using VideoService
    const updatedVideo = await VideoService.updateVisibility(
      videoId,
      session.user.id,
      visibility,
    );

    if (!updatedVideo) {
      return { success: false, error: "Video not found or access denied" };
    }

    // Revalidate paths
    revalidatePath("/profile/videos");
    revalidatePath("/library");
    revalidatePath(`/video/${videoId}`);

    return {
      success: true,
      message: `Video is now ${visibility}`,
      video: updatedVideo,
    };
  } catch (error) {
    console.error("❌ Error updating visibility:", error);
    return { success: false, error: "Failed to update visibility" };
  }
}

/**
 * Update video details (title, description, etc.)
 */
export async function updateVideoDetails(
  videoId: string,
  data: {
    title?: string;
    description?: string;
    visibility?: "public" | "private";
  },
): Promise<{
  success: boolean;
  error?: string;
  message?: string;
  video?: VideoWithUser;
}> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const updatedVideo = await VideoService.updateVideo(
      videoId,
      session.user.id,
      data,
    );

    if (!updatedVideo) {
      return { success: false, error: "Video not found or access denied" };
    }

    // Revalidate paths
    revalidatePath("/profile/videos");
    // revalidatePath('/library');
    revalidatePath(`/video/${videoId}`);

    return {
      success: true,
      message: "Video updated successfully",
      video: updatedVideo,
    };
  } catch (error) {
    console.error("❌ Error updating video:", error);
    return { success: false, error: "Failed to update video" };
  }
}

// ========== DELETE OPERATIONS ==========

/**
 * Delete video
 */
export async function deleteVideo(
  videoId: string,
): Promise<{ success: boolean; error?: string; message?: string }> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const deleted = await VideoService.deleteVideo(videoId, session.user.id);

    if (!deleted) {
      return { success: false, error: "Video not found or access denied" };
    }

    // TODO: Delete video files from storage
    // await deleteVideoFile(video.videoUrl);
    // await deleteThumbnail(video.thumbnailUrl);

    // Revalidate paths
    revalidatePath("/profile/videos");
    // revalidatePath('/library');

    return {
      success: true,
      message: "Video deleted successfully",
    };
  } catch (error) {
    console.error("❌ Error deleting video:", error);
    return { success: false, error: "Failed to delete video" };
  }
}

// ========== VIEW INCREMENT ==========

/**
 * Increment video views
 */
// export async function incrementVideoViews(videoId: string): Promise<void> {
//   try {
//     await VideoService.incrementViews(videoId);
//   } catch (error) {
//     console.error('❌ Error incrementing views:', error);
//   }
// }


export async function revalidateHomePage() {
  revalidatePath("/");
}