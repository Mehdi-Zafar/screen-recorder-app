import Header from "@/components/Header";
import VideoCard from "@/components/VideoCard";
import { Video, VideoWithUser } from "@/lib/db/schema";
import { VideoService } from "@/lib/services/video-service";
import React from "react";

const sampleVideos = [
  {
    thumbnail:
      "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=225&fit=crop&crop=center",
    title: "Complete Next.js Tutorial for Beginners",
    duration: "45:23",
    authorName: "Sarah Chen",
    authorAvatar:
      "https://images.unsplash.com/photo-1494790108755-2616b667906c?w=40&h=40&fit=crop&crop=face",
    views: "12K views",
    createdAt: "3 days ago",
  },
  {
    thumbnail:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=225&fit=crop&crop=center",
    title: "Advanced React Patterns and Best Practices",
    duration: "28:15",
    authorName: "Mike Johnson",
    authorAvatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
    views: "8.5K views",
    createdAt: "1 week ago",
  },
  {
    thumbnail:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=225&fit=crop&crop=center",
    title: "Building Responsive Web Design with Tailwind CSS",
    duration: "33:47",
    authorName: "Alex Rodriguez",
    authorAvatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
    views: "5.2K views",
    createdAt: "2 weeks ago",
  },
];

export default async function page() {

  const fetchedVideos = await VideoService.getPublicVideosAll();
  const allVideos:VideoWithUser[] = [...fetchedVideos];
  return (
    <div>
      <Header title="Public Library" subtitle="Explore the library" img=""/>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 max-w-7xl mx-auto my-8">
        {allVideos.map((video, index) => (
          <VideoCard key={index} video={video} />
        ))}
      </div>
    </div>
  );
}
