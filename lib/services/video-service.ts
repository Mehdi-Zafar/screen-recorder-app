import { db } from "@/lib/db";
import { users, videos, type NewVideo } from "@/lib/db/schema";
import { eq, and, desc, count, sql, or, ilike, lte, gte, asc } from "drizzle-orm";
import { videoWithUserSelect } from "../db/queries/videoQueries";
import { VideoWithUser } from "@/lib/db/schema";
import { Filters, PaginationOptions } from "../types/video";
import { deleteVideoFiles } from "../uploadthing/delete";

export class VideoService {
  static async createVideo(data: NewVideo) {
    const [video] = await db
      .insert(videos)
      .values({
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    if (!video) throw new Error("Failed to create video");

    // fetch with user
    const [videoWithUser] = await db
      .select(videoWithUserSelect)
      .from(videos)
      .leftJoin(users, eq(videos.userId, users.id))
      .where(eq(videos.id, video.id));

    return videoWithUser;
  }

  static async getUserVideosApi(userId: string, options: PaginationOptions) {
    const { page, limit, visibility } = options;
    const offset = (page - 1) * limit;

    let whereConditions = eq(videos.userId, userId);
    if (visibility) {
      whereConditions = and(whereConditions, eq(videos.visibility, visibility));
    }

    const [totalResult] = await db
      .select({ count: count() })
      .from(videos)
      .where(whereConditions);

    const total = totalResult?.count || 0;

    const videoList = await db
      .select(videoWithUserSelect)
      .from(videos)
      .leftJoin(users, eq(videos.userId, users.id))
      .where(whereConditions)
      .orderBy(desc(videos.createdAt))
      .limit(limit)
      .offset(offset);

    return { data: videoList, total };
  }

  static async getUserVideos(
    userId: string,
    limit = 20,
    offset = 0,
  ): Promise<VideoWithUser[]> {
    return await db
      .select(videoWithUserSelect)
      .from(videos)
      .leftJoin(users, eq(videos.userId, users.id))
      .where(eq(videos.userId, userId))
      .orderBy(desc(videos.createdAt))
      .limit(limit)
      .offset(offset);
  }

  static async getAllUserVideos(userId: string) {
    return await db
      .select(videoWithUserSelect)
      .from(videos)
      .leftJoin(users, eq(videos.userId, users.id))
      .where(eq(videos.userId, userId))
      .orderBy(desc(videos.createdAt));
  }

  static async getVideoById(id: string, userId: string) {
    const [video] = await db
      .select(videoWithUserSelect)
      .from(videos)
      .leftJoin(users, eq(videos.userId, users.id))
      .where(and(eq(videos.id, id), eq(videos.userId, userId)));

    return video || null;
  }

  // ✅ Search user videos
  static async searchUserVideos(
    userId: string,
    searchQuery: string,
    limit = 20,
    offset = 0,
  ): Promise<VideoWithUser[]> {
    const searchTerm = `%${searchQuery}%`;

    return await db
      .select(videoWithUserSelect)
      .from(videos)
      .leftJoin(users, eq(videos.userId, users.id))
      .where(
        and(
          eq(videos.userId, userId),
          or(
            ilike(videos.title, searchTerm),
            ilike(videos.description, searchTerm),
          ),
        ),
      )
      .orderBy(desc(videos.createdAt))
      .limit(limit)
      .offset(offset);
  }

  // static async getPublicVideosAll(limit = 20, offset = 0) {
  //   return await db
  //     .select(videoWithUserSelect)
  //     .from(videos)
  //     .leftJoin(users, eq(videos.userId, users.id))
  //     .where(eq(videos.visibility, "public"))
  //     .orderBy(desc(videos.createdAt))
  //     .limit(limit)
  //     .offset(offset);
  // }

  // static async getPublicVideos(
  //   limit = 20,
  //   offset = 0,
  // ): Promise<VideoWithUser[]> {
  //   return await db
  //     .select(videoWithUserSelect)
  //     .from(videos)
  //     .leftJoin(users, eq(videos.userId, users.id))
  //     .where(eq(videos.visibility, "public"))
  //     .orderBy(desc(videos.createdAt))
  //     .limit(limit)
  //     .offset(offset);
  // }

  static async getPublicVideoById(id: string) {
    const [video] = await db
      .select(videoWithUserSelect)
      .from(videos)
      .leftJoin(users, eq(videos.userId, users.id))
      .where(and(eq(videos.id, id), eq(videos.visibility, "public")));

    return video || null;
  }

  // ✅ Search public videos
  // static async searchPublicVideos(
  //   searchQuery: string,
  //   limit = 20,
  //   offset = 0,
  // ): Promise<VideoWithUser[]> {
  //   const searchTerm = `%${searchQuery}%`;

  //   return await db
  //     .select(videoWithUserSelect)
  //     .from(videos)
  //     .leftJoin(users, eq(videos.userId, users.id))
  //     .where(
  //       and(
  //         eq(videos.visibility, "public"),
  //         or(
  //           ilike(videos.title, searchTerm),
  //           ilike(videos.description, searchTerm),
  //           ilike(users.name, searchTerm),
  //         ),
  //       ),
  //     )
  //     .orderBy(desc(videos.createdAt))
  //     .limit(limit)
  //     .offset(offset);
  // }

 /**
   * Helper: Build date filter conditions
   */
  private static buildDateFilters(dateRanges: string[]) {
    if (dateRanges.length === 0) return null;

    const dateConditions = dateRanges
      .map((range) => {
        const now = new Date();
        switch (range) {
          case 'today':
            const startOfToday = new Date(now.setHours(0, 0, 0, 0));
            return gte(videos.createdAt, startOfToday);
          case 'week':
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - 7);
            return gte(videos.createdAt, startOfWeek);
          case 'month':
            const startOfMonth = new Date(now);
            startOfMonth.setMonth(now.getMonth() - 1);
            return gte(videos.createdAt, startOfMonth);
          case 'year':
            const startOfYear = new Date(now);
            startOfYear.setFullYear(now.getFullYear() - 1);
            return gte(videos.createdAt, startOfYear);
          default:
            return null;
        }
      })
      .filter(Boolean);

    return dateConditions.length > 0 ? or(...dateConditions) : null;
  }

  /**
   * Helper: Build duration filter conditions
   */
  private static buildDurationFilters(durations: string[]) {
    if (durations.length === 0) return null;

    const durationConditions = durations
      .map((dur) => {
        switch (dur) {
          case 'short':
            return lte(videos.duration, 300); // < 5 minutes
          case 'medium':
            return and(gte(videos.duration, 300), lte(videos.duration, 1200)); // 5-20 min
          case 'long':
            return gte(videos.duration, 1200); // > 20 minutes
          default:
            return null;
        }
      })
      .filter(Boolean);

    return durationConditions.length > 0 ? or(...durationConditions) : null;
  }

  /**
   * Helper: Build visibility filter conditions
   */
  private static buildVisibilityFilters(visibilities: string[]) {
    if (visibilities.length === 0) return null;

    const visibilityConditions = visibilities
      .map((vis) => {
        if (vis === 'public' || vis === 'private') {
          return eq(videos.visibility, vis);
        }
        return null;
      })
      .filter(Boolean);

    return visibilityConditions.length > 0
      ? or(...visibilityConditions)
      : null;
  }

  /**
   * Helper: Build sort order
   */
  private static buildSortOrder(sortBy: string) {
    switch (sortBy) {
      case 'oldest':
        return asc(videos.createdAt);
      case 'most-viewed':
        return desc(videos.views);
      case 'least-viewed':
        return asc(videos.views);
      case 'longest':
        return desc(videos.duration);
      case 'shortest':
        return asc(videos.duration);
      case 'title-asc':
        return asc(videos.title);
      case 'title-desc':
        return desc(videos.title);
      case 'latest':
      default:
        return desc(videos.createdAt);
    }
  }

  /**
   * Get public videos with filters and sorting
   */
  static async getPublicVideosWithFilters(
    filters: Filters,
    sortBy: string = 'latest',
    limit = 20,
    offset = 0
  ): Promise<VideoWithUser[]> {
    const conditions = [eq(videos.visibility, 'public')];

    const dateFilter = this.buildDateFilters(filters.dateRange);
    if (dateFilter) conditions.push(dateFilter);

    const durationFilter = this.buildDurationFilters(filters.duration);
    if (durationFilter) conditions.push(durationFilter);

    return await db
      .select(videoWithUserSelect)
      .from(videos)
      .leftJoin(users, eq(videos.userId, users.id))
      .where(and(...conditions))
      .orderBy(this.buildSortOrder(sortBy)) // ✅ Apply sorting
      .limit(limit)
      .offset(offset);
  }

  /**
   * Search public videos with filters and sorting
   */
  static async searchPublicVideosWithFilters(
    searchQuery: string,
    filters: Filters,
    sortBy: string = 'latest',
    limit = 20,
    offset = 0
  ): Promise<VideoWithUser[]> {
    const searchTerm = `%${searchQuery}%`;
    const conditions = [
      eq(videos.visibility, 'public'),
      or(
        ilike(videos.title, searchTerm),
        ilike(videos.description, searchTerm),
        ilike(users.name, searchTerm)
      ),
    ];

    const dateFilter = this.buildDateFilters(filters.dateRange);
    if (dateFilter) conditions.push(dateFilter);

    const durationFilter = this.buildDurationFilters(filters.duration);
    if (durationFilter) conditions.push(durationFilter);

    return await db
      .select(videoWithUserSelect)
      .from(videos)
      .leftJoin(users, eq(videos.userId, users.id))
      .where(and(...conditions))
      .orderBy(this.buildSortOrder(sortBy)) // ✅ Apply sorting
      .limit(limit)
      .offset(offset);
  }

  /**
   * Get user videos with filters and sorting
   */
  static async getUserVideosWithFilters(
    userId: string,
    filters: Filters,
    sortBy: string = 'latest',
    limit = 20,
    offset = 0
  ): Promise<VideoWithUser[]> {
    const conditions = [eq(videos.userId, userId)];

    const dateFilter = this.buildDateFilters(filters.dateRange);
    if (dateFilter) conditions.push(dateFilter);

    const durationFilter = this.buildDurationFilters(filters.duration);
    if (durationFilter) conditions.push(durationFilter);

    const visibilityFilter = this.buildVisibilityFilters(filters.visibility);
    if (visibilityFilter) conditions.push(visibilityFilter);

    return await db
      .select(videoWithUserSelect)
      .from(videos)
      .leftJoin(users, eq(videos.userId, users.id))
      .where(and(...conditions))
      .orderBy(this.buildSortOrder(sortBy)) // ✅ Apply sorting
      .limit(limit)
      .offset(offset);
  }

  /**
   * Search user videos with filters and sorting
   */
  static async searchUserVideosWithFilters(
    userId: string,
    searchQuery: string,
    filters: Filters,
    sortBy: string = 'latest',
    limit = 20,
    offset = 0
  ): Promise<VideoWithUser[]> {
    const searchTerm = `%${searchQuery}%`;
    const conditions = [
      eq(videos.userId, userId),
      or(
        ilike(videos.title, searchTerm),
        ilike(videos.description, searchTerm)
      ),
    ];

    const dateFilter = this.buildDateFilters(filters.dateRange);
    if (dateFilter) conditions.push(dateFilter);

    const durationFilter = this.buildDurationFilters(filters.duration);
    if (durationFilter) conditions.push(durationFilter);

    const visibilityFilter = this.buildVisibilityFilters(filters.visibility);
    if (visibilityFilter) conditions.push(visibilityFilter);

    return await db
      .select(videoWithUserSelect)
      .from(videos)
      .leftJoin(users, eq(videos.userId, users.id))
      .where(and(...conditions))
      .orderBy(this.buildSortOrder(sortBy)) // ✅ Apply sorting
      .limit(limit)
      .offset(offset);
  }

  static async updateVideo(
    id: string,
    userId: string,
    updates: Partial<Omit<NewVideo, "userId">>,
  ) {
    const [video] = await db
      .update(videos)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(videos.id, id), eq(videos.userId, userId)))
      .returning();

    if (!video) return null;

    const [videoWithUser] = await db
      .select(videoWithUserSelect)
      .from(videos)
      .leftJoin(users, eq(videos.userId, users.id))
      .where(eq(videos.id, video.id));

    return videoWithUser;
  }

  // static async deleteVideo(id: string, userId: string) {
  //   const result = await db
  //     .delete(videos)
  //     .where(and(eq(videos.id, id), eq(videos.userId, userId)));

  //   return result.rowCount > 0;
  // }

  // static async getPublicVideos(options: PaginationOptions) {
  //   const { page, limit } = options;
  //   const offset = (page - 1) * limit;

  //   const [totalResult] = await db
  //     .select({ count: count() })
  //     .from(videos)
  //     .where(eq(videos.visibility, "public"));

  //   const total = totalResult?.count || 0;

  //   const videoList = await db
  //     .select(videoWithUserSelect)
  //     .from(videos)
  //     .leftJoin(users, eq(videos.userId, users.id))
  //     .where(eq(videos.visibility, "public"))
  //     .orderBy(desc(videos.createdAt))
  //     .limit(limit)
  //     .offset(offset);

  //   return { data: videoList, total };
  // }

  // static async searchPublicVideos(query: string, options: PaginationOptions) {
  //   const { page, limit } = options;
  //   const offset = (page - 1) * limit;
  //   const searchPattern = `%${query.toLowerCase()}%`;

  //   const [totalResult] = await db
  //     .select({ count: count() })
  //     .from(videos)
  //     .where(
  //       and(
  //         eq(videos.visibility, "public"),
  //         sql`LOWER(${videos.title}) LIKE ${searchPattern}`
  //       )
  //     );

  //   const total = totalResult?.count || 0;

  //   const videoList = await db
  //     .select(videoWithUserSelect)
  //     .from(videos)
  //     .leftJoin(users, eq(videos.userId, users.id))
  //     .where(
  //       and(
  //         eq(videos.visibility, "public"),
  //         sql`LOWER(${videos.title}) LIKE ${searchPattern}`
  //       )
  //     )
  //     .orderBy(desc(videos.createdAt))
  //     .limit(limit)
  //     .offset(offset);

  //   return { data: videoList, total };
  // }

  static async getAuthorizedVideoById(
    id: string,
    userId?: string,
  ): Promise<VideoWithUser | null> {
    const [video] = await db
      .select(videoWithUserSelect)
      .from(videos)
      .leftJoin(users, eq(videos.userId, users.id))
      .where(
        and(
          eq(videos.id, id),
          or(
            eq(videos.visibility, "public"),
            userId ? eq(videos.userId, userId) : undefined,
          ),
        ),
      )
      .limit(1);

    return video || null;
  }

  static async getVideoByIdForOwner(
    videoId: string,
    userId: string,
  ): Promise<VideoWithUser | null> {
    const [video] = await db
      .select(videoWithUserSelect)
      .from(videos)
      .leftJoin(users, eq(videos.userId, users.id))
      .where(and(eq(videos.id, videoId), eq(videos.userId, userId)))
      .limit(1);

    return video || null;
  }

  /**
   * Update video visibility (public/private)
   */
  static async updateVisibility(
    videoId: string,
    userId: string,
    visibility: "public" | "private",
  ): Promise<VideoWithUser | null> {
    // First verify ownership
    const existingVideo = await this.getVideoByIdForOwner(videoId, userId);

    if (!existingVideo) {
      return null;
    }

    // Update visibility
    const [updatedVideo] = await db
      .update(videos)
      .set({
        visibility,
        updatedAt: new Date(),
      })
      .where(eq(videos.id, videoId))
      .returning();

    if (!updatedVideo) {
      return null;
    }

    // Return updated video with user info
    return await this.getAuthorizedVideoById(videoId, userId);
  }

  /**
   * Update video details (title, description, etc.)
   */
  // static async updateVideo(
  //   videoId: string,
  //   userId: string,
  //   data: {
  //     title?: string;
  //     description?: string;
  //     visibility?: 'public' | 'private';
  //   }
  // ): Promise<VideoWithUser | null> {
  //   // Verify ownership
  //   const existingVideo = await this.getVideoByIdForOwner(videoId, userId);

  //   if (!existingVideo) {
  //     return null;
  //   }

  //   // Update video
  //   const [updatedVideo] = await db
  //     .update(videos)
  //     .set({
  //       ...data,
  //       updatedAt: new Date(),
  //     })
  //     .where(eq(videos.id, videoId))
  //     .returning();

  //   if (!updatedVideo) {
  //     return null;
  //   }

  //   return await this.getVideoById(videoId);
  // }

  /**
   * Increment video views
   */
  static async incrementViews(videoId: string): Promise<void> {
    await db
      .update(videos)
      .set({
        views: sql`${videos.views} + 1`, // ✅ Use sql template
      })
      .where(eq(videos.id, videoId));
  }

  // ========== DELETE OPERATIONS ==========

  /**
   * Delete video (owner only)
   */
  static async deleteVideo(videoId: string, userId: string): Promise<boolean> {
    // Verify ownership
    const existingVideo = await this.getVideoByIdForOwner(videoId, userId);

    if (!existingVideo) {
      return false;
    }

    try {
      // Delete video
      await db.delete(videos).where(eq(videos.id, videoId));

      deleteVideoFiles(
        existingVideo.videoUrl,
        existingVideo.thumbnailUrl || undefined,
      ).catch((error) => {
        // Log error but don't fail the deletion
        console.error("Failed to delete files from UploadThing:", error);
      });

      return true;
    } catch (error) {
      console.error("Error deleting video:", error);
      throw error;
    }
  }

  // ========== COUNT OPERATIONS ==========

  static async getPublicVideosCount(): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(videos)
      .where(eq(videos.visibility, "public"));

    return result?.count || 0;
  }

  static async getUserVideosCount(userId: string): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(videos)
      .where(eq(videos.userId, userId));

    return result?.count || 0;
  }
}
