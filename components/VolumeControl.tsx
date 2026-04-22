"use client";

import { useState } from "react";
import { Volume1, Volume2, VolumeX } from "lucide-react";
import { VideoPlayerState } from "@/lib/types/video";

interface VolumeControlProps {
  state: VideoPlayerState;
  onMuteToggle: () => void;
  onVolumeChange: (volume: number) => void;
}

export default function VolumeControl({
  state,
  onMuteToggle,
  onVolumeChange,
}: VolumeControlProps) {
  const [showSlider, setShowSlider] = useState(false);

  const VolumeIcon =
    state.isMuted || state.volume === 0
      ? VolumeX
      : state.volume < 0.5
        ? Volume1
        : Volume2;

  return (
    <div
      className="relative flex items-center"
      onMouseEnter={() => setShowSlider(true)}
      onMouseLeave={() => setShowSlider(false)}
    >
      <button
        onClick={onMuteToggle}
        className="text-white hover:text-gray-300 transition-colors"
        aria-label={state.isMuted ? "Unmute" : "Mute"}
      >
        <VolumeIcon className="w-5 h-5" />
      </button>

      {showSlider && (
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={state.isMuted ? 0 : state.volume}
          onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
          className="ml-1 w-20 h-1 accent-white cursor-pointer"
          aria-label="Volume"
        />
      )}
    </div>
  );
}
