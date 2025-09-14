// lib/db/queries/videoQueries.ts
import { videos, users } from "@/lib/db/schema";

export const videoWithUserSelect = {
  id: videos.id,
  title: videos.title,
  description: videos.description,
  videoUrl: videos.videoUrl,
  thumbnailUrl: videos.thumbnailUrl,
  visibility: videos.visibility,
  views: videos.views,
  duration: videos.duration,
  createdAt: videos.createdAt,
  updatedAt: videos.updatedAt,
  userId: videos.userId,
  user: {
    id: users.id,
    name: users.name,
    image: users.image,
  },
};
