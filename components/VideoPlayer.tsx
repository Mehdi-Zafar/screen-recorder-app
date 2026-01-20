"use client";

import { useVideoPlayer } from "@/hooks/useVideoPlayer";
import VideoControls from "./VideoControls";
import { Loader2 } from "lucide-react";
import { VideoPlayerProps } from "@/lib/types/video";
import { useEffect, useRef, useState } from "react";
import { incrementVideoViews } from "@/lib/actions/video.actions";
import { getSessionArray, setSessionArray } from "@/lib/helpers";
import { SESSION_VIEWED_VIDEOS } from "@/lib/constants";

export default function VideoPlayer({
  video,
  onTimeUpdate,
  onEnded,
  autoPlay = false,
  isOwner,
}: VideoPlayerProps) {
  const { videoRef, state, actions } = useVideoPlayer();
  const { videoUrl, thumbnailUrl, title, id: videoId } = video;
  const [viewCount, setViewCount] = useState(video.views);
  const viewCounted = useRef(false);
  const watchStartTime = useRef<number | null>(null);

  useEffect(() => {
    // ✅ Don't count owner's views
    if (isOwner) return;

    // ✅ Check if already viewed in this session
    const viewedVideos = getSessionArray<string>(SESSION_VIEWED_VIDEOS);

    if (viewedVideos.includes(videoId)) {
      viewCounted.current = true;
      return;
    }

    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handlePlay = () => {
      // ✅ Start tracking watch time when video starts playing
      if (!watchStartTime.current) {
        watchStartTime.current = Date.now();
      }
    };

    const handleTimeUpdate = async () => {
      // ✅ Guard: Already counted or not started watching
      if (viewCounted.current || !watchStartTime.current) return;

      const videoDuration = videoElement.duration;

      // ✅ Wait until video duration is loaded
      if (!videoDuration || isNaN(videoDuration)) return;

      const watchedTime = Date.now() - watchStartTime.current;
      const videoDurationMs = videoDuration * 1000;

      // ✅ Calculate threshold: 30 seconds OR 30% of video (whichever is LESS)
      const thirtyPercent = videoDurationMs * 0.3;
      const viewThreshold = Math.min(30000, thirtyPercent);

      // ✅ Check if watched enough time
      if (watchedTime >= viewThreshold) {
        // ✅ Set guard flag IMMEDIATELY
        viewCounted.current = true;

        // ✅ Mark as viewed in session
        const viewedVideos = getSessionArray<string>(SESSION_VIEWED_VIDEOS);
        viewedVideos.push(videoId);
        setSessionArray(SESSION_VIEWED_VIDEOS, viewedVideos);

        // ✅ Update UI optimistically
        setViewCount((prev) => prev + 1);

        // ✅ Update server
        await incrementVideoViews(videoId);

        // ✅ Cleanup listeners
        videoElement.removeEventListener("play", handlePlay);
        videoElement.removeEventListener("timeupdate", handleTimeUpdate);
      }
    };

    videoElement.addEventListener("play", handlePlay);
    videoElement.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      videoElement.removeEventListener("play", handlePlay);
      videoElement.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [videoId, isOwner, videoRef]);

  return (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden group">
      {/* Video Element */}
      <video
        ref={videoRef}
        src={videoUrl}
        poster={thumbnailUrl}
        className="w-full h-full"
        autoPlay={autoPlay}
        playsInline
        preload="metadata"
        onTimeUpdate={() => onTimeUpdate?.(state.currentTime)}
        onEnded={onEnded}
        aria-label={`Video player for ${title}`}
      >
        Your browser does not support the video tag.
      </video>

      {/* Loading Spinner */}
      {state.isWaiting && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <Loader2 className="w-12 h-12 text-white animate-spin" />
        </div>
      )}

      {/* Play/Pause Overlay (centered) */}
      <button
        onClick={actions.togglePlay}
        className="absolute inset-0 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        aria-label={state.isPlaying ? "Pause" : "Play"}
      >
        <div className="w-20 h-20 rounded-full bg-black/60 flex items-center justify-center backdrop-blur-sm">
          {state.isPlaying ? (
            <svg
              className="w-10 h-10 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg
              className="w-10 h-10 text-white ml-1"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </div>
      </button>

      {/* Video Controls */}
      <VideoControls state={state} actions={actions} title={title} />
    </div>
  );
}
