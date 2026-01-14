import { db } from "@/lib/db";
import { users, videos, type NewVideo } from "@/lib/db/schema";
import { eq, and, desc, count, sql, or, ilike } from "drizzle-orm";
import { videoWithUserSelect } from "../db/queries/videoQueries";
import { VideoWithUser } from "@/lib/db/schema";
import { PaginationOptions } from "../types/video";

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

  static async getUserVideos(userId: string, limit = 20, offset = 0): Promise<VideoWithUser[]> {
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
    offset = 0
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
            ilike(videos.description, searchTerm)
          )
        )
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

  static async getPublicVideos(limit = 20, offset = 0): Promise<VideoWithUser[]> {
    return await db
      .select(videoWithUserSelect)
      .from(videos)
      .leftJoin(users, eq(videos.userId, users.id))
      .where(eq(videos.visibility, 'public'))
      .orderBy(desc(videos.createdAt))
      .limit(limit)
      .offset(offset);
  }

  static async getPublicVideoById(id: string) {
    const [video] = await db
      .select(videoWithUserSelect)
      .from(videos)
      .leftJoin(users, eq(videos.userId, users.id))
      .where(and(eq(videos.id, id), eq(videos.visibility, "public")));

    return video || null;
  }

  // ✅ Search public videos
  static async searchPublicVideos(
    searchQuery: string,
    limit = 20,
    offset = 0
  ): Promise<VideoWithUser[]> {
    const searchTerm = `%${searchQuery}%`;

    return await db
      .select(videoWithUserSelect)
      .from(videos)
      .leftJoin(users, eq(videos.userId, users.id))
      .where(
        and(
          eq(videos.visibility, 'public'),
          or(
            ilike(videos.title, searchTerm),
            ilike(videos.description, searchTerm),
            ilike(users.name, searchTerm)
          )
        )
      )
      .orderBy(desc(videos.createdAt))
      .limit(limit)
      .offset(offset);
  }

  static async updateVideo(
    id: string,
    userId: string,
    updates: Partial<Omit<NewVideo, "userId">>
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

  static async deleteVideo(id: string, userId: string) {
    const result = await db
      .delete(videos)
      .where(and(eq(videos.id, id), eq(videos.userId, userId)));

    return result.rowCount > 0;
  }

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
    userId?: string
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
            userId ? eq(videos.userId, userId) : undefined
          )
        )
      )
      .limit(1);

    return video || null;
  }
}
