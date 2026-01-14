"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import type { VideoWithUser } from "@/lib/db/schema";
import { VideoService } from "../services/video-service";

/**
 * Search public videos with infinite scroll
 */
export async function searchPublicVideos(
  searchQuery: string,
  offset: number,
  limit: number = 20
): Promise<{ videos: VideoWithUser[]; hasMore: boolean }> {
  try {
    console.log(
      `🔍 Searching public videos: "${searchQuery}", offset: ${offset}`
    );

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
  limit: number = 20
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
  limit: number = 20
): Promise<{ videos: VideoWithUser[]; hasMore: boolean }> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { videos: [], hasMore: false };
  }

  try {
    console.log(
      `🔍 Searching user videos: "${searchQuery}", offset: ${offset}`
    );

    const videos = searchQuery.trim()
      ? await VideoService.searchUserVideos(
          session.user.id,
          searchQuery,
          limit + 1,
          offset
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
