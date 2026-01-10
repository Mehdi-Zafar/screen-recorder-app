"use client";

import { useRef, useState } from "react";

interface VideoTimelineProps {
  currentTime: number;
  duration: number;
  buffered: number;
  onSeek: (time: number) => void;
}

export default function VideoTimeline({
  currentTime,
  duration,
  buffered,
  onSeek,
}: VideoTimelineProps) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [isSeeking, setIsSeeking] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current || duration === 0) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;

    onSeek(newTime - currentTime);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current || duration === 0) return;

    const rect = timelineRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const time = percent * duration;

    setHoverTime(time);
  };

  const handleMouseLeave = () => {
    setHoverTime(null);
  };

  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div
      ref={timelineRef}
      className="relative w-full h-1 bg-gray-600 rounded-full cursor-pointer group"
      onClick={handleSeek}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseDown={() => setIsSeeking(true)}
      onMouseUp={() => setIsSeeking(false)}
      role="slider"
      aria-label="Video timeline"
      aria-valuemin={0}
      aria-valuemax={duration}
      aria-valuenow={currentTime}
    >
      {/* Buffered Progress */}
      <div
        className="absolute h-full bg-gray-400 rounded-full transition-all"
        style={{ width: `${buffered}%` }}
      />

      {/* Current Progress */}
      <div
        className="absolute h-full bg-red-600 rounded-full transition-all group-hover:bg-red-500"
        style={{ width: `${progressPercent}%` }}
      />

      {/* Seek Handle */}
      <div
        className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        style={{
          left: `${progressPercent}%`,
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* Hover Tooltip */}
      {hoverTime !== null && (
        <div
          className="absolute bottom-full mb-2 px-2 py-1 bg-black/90 text-white text-xs rounded pointer-events-none"
          style={{
            left: `${(hoverTime / duration) * 100}%`,
            transform: "translateX(-50%)",
          }}
        >
          {formatTime(hoverTime)}
        </div>
      )}
    </div>
  );
}
