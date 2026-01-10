"use client";

import { VideoPlayerState } from "@/lib/types/video";
import VideoTimeline from "./VideoTimeline";
import VolumeControl from "./VolumeControl";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Maximize,
  Minimize,
  PictureInPicture,
  Settings,
} from "lucide-react";
import { useState } from "react";

interface VideoControlsProps {
  state: VideoPlayerState;
  actions: {
    togglePlay: () => void;
    skip: (seconds: number) => void;
    toggleFullscreen: () => void;
    togglePictureInPicture: () => void;
    setPlaybackRate: (rate: number) => void;
  };
  title: string;
}

export default function VideoControls({
  state,
  actions,
  title,
}: VideoControlsProps) {
  const [showSettings, setShowSettings] = useState(false);

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const playbackRates = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
      {/* Timeline */}
      <VideoTimeline
        currentTime={state.currentTime}
        duration={state.duration}
        buffered={state.buffered}
        onSeek={actions.skip}
      />

      {/* Control Buttons */}
      <div className="flex items-center justify-between mt-3">
        {/* Left Controls */}
        <div className="flex items-center gap-3">
          {/* Play/Pause */}
          <button
            onClick={actions.togglePlay}
            className="text-white hover:text-gray-300 transition-colors"
            aria-label={state.isPlaying ? "Pause" : "Play"}
          >
            {state.isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6" />
            )}
          </button>

          {/* Skip Backward */}
          <button
            onClick={() => actions.skip(-10)}
            className="text-white hover:text-gray-300 transition-colors"
            aria-label="Skip backward 10 seconds"
          >
            <SkipBack className="w-5 h-5" />
          </button>

          {/* Skip Forward */}
          <button
            onClick={() => actions.skip(10)}
            className="text-white hover:text-gray-300 transition-colors"
            aria-label="Skip forward 10 seconds"
          >
            <SkipForward className="w-5 h-5" />
          </button>

          {/* Volume Control */}
          <VolumeControl state={state} />

          {/* Time Display */}
          <div className="text-white text-sm font-medium ml-2">
            {formatTime(state.currentTime)} / {formatTime(state.duration)}
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3 relative">
          {/* Playback Speed */}
          <div className="relative">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="text-white hover:text-gray-300 transition-colors"
              aria-label="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>

            {showSettings && (
              <div className="absolute bottom-full right-0 mb-2 bg-black/95 rounded-lg p-2 min-w-[120px]">
                <div className="text-white text-xs font-semibold mb-2 px-2">
                  Playback Speed
                </div>
                {playbackRates.map((rate) => (
                  <button
                    key={rate}
                    onClick={() => {
                      actions.setPlaybackRate(rate);
                      setShowSettings(false);
                    }}
                    className={`w-full text-left px-2 py-1 text-sm rounded transition-colors ${
                      state.playbackRate === rate
                        ? "bg-white/20 text-white"
                        : "text-gray-300 hover:bg-white/10"
                    }`}
                  >
                    {rate}x {rate === 1 && "(Normal)"}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Picture-in-Picture */}
          <button
            onClick={actions.togglePictureInPicture}
            className="text-white hover:text-gray-300 transition-colors"
            aria-label="Picture in Picture"
          >
            <PictureInPicture className="w-5 h-5" />
          </button>

          {/* Fullscreen */}
          <button
            onClick={actions.toggleFullscreen}
            className="text-white hover:text-gray-300 transition-colors"
            aria-label={
              state.isFullscreen ? "Exit fullscreen" : "Enter fullscreen"
            }
          >
            {state.isFullscreen ? (
              <Minimize className="w-5 h-5" />
            ) : (
              <Maximize className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Title (shown in fullscreen) */}
      {state.isFullscreen && (
        <div className="absolute top-4 left-4 text-white text-lg font-semibold">
          {title}
        </div>
      )}
    </div>
  );
}
