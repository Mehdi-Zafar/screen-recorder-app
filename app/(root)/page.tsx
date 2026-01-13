import Header from "@/components/Header";
import VideoCard from "@/components/VideoCard";
import VideoGrid from "@/components/VideoGrid";
import { loadMorePublicVideos } from "@/lib/actions/video.actions";
import { Video, VideoWithUser } from "@/lib/db/schema";
import { VideoService } from "@/lib/services/video-service";
import React from "react";

export default async function page() {

  const fetchedVideos = await VideoService.getPublicVideos(6);
  // const initialVideos = await VideoService.getPublicVideos(20, 0);
  const allVideos:VideoWithUser[] = [...fetchedVideos];
  return (
    <div>
      <Header title="Public Library" subtitle="Explore the library" img=""/>
      {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 max-w-7xl mx-auto my-8">
        {allVideos.map((video, index) => (
          <VideoCard key={index} video={video} />
        ))}
      </div> */}
      <VideoGrid
        initialVideos={allVideos}
        loadMoreAction={loadMorePublicVideos}
        emptyMessage="No public videos available yet"
      />
    </div>
  );
}
