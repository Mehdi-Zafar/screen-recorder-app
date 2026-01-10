"use client";

import { useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { VideoPlayerState } from "@/lib/types/video";

interface VolumeControlProps {
  state: VideoPlayerState;
}

export default function VolumeControl({ state }: VolumeControlProps) {
  const [showSlider, setShowSlider] = useState(false);

  return (
    <div
      className="relative flex items-center"
      onMouseEnter={() => setShowSlider(true)}
      onMouseLeave={() => setShowSlider(false)}
    >
      <button
        className="text-white hover:text-gray-300 transition-colors"
        aria-label={state.isMuted ? "Unmute" : "Mute"}
      >
        {state.isMuted || state.volume === 0 ? (
          <VolumeX className="w-5 h-5" />
        ) : (
          <Volume2 className="w-5 h-5" />
        )}
      </button>

      {showSlider && (
        <div className="absolute left-full ml-2 w-20 h-1 bg-gray-600 rounded-full">
          <div
            className="h-full bg-white rounded-full"
            style={{ width: `${state.volume * 100}%` }}
          />
        </div>
      )}
    </div>
  );
}
