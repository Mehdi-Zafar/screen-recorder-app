import { VideoWithUser } from "../db/schema";

export interface VideoPlayerProps {
  videoUrl: string;
  thumbnailUrl: string;
  title: string;
  autoPlay?: boolean;
  onTimeUpdate?: (currentTime: number) => void;
  onEnded?: () => void;
}

export interface VideoPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isFullscreen: boolean;
  playbackRate: number;
  buffered: number;
  isWaiting: boolean;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  visibility?: "public" | "private";
}

export interface PaginatedVideos {
  data: VideoWithUser[]; // video + user
  total: number;
}
