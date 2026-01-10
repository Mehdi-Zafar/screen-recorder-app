"use client";

import { useVideoPlayer } from "@/hooks/useVideoPlayer";
import VideoControls from "./VideoControls";
import { Loader2 } from "lucide-react";
import { VideoPlayerProps } from "@/lib/types/video";

export default function VideoPlayer({
  videoUrl,
  thumbnailUrl,
  title,
  autoPlay = false,
  onTimeUpdate,
  onEnded,
}: VideoPlayerProps) {
  const { videoRef, state, actions } = useVideoPlayer();

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
