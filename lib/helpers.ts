import { toast } from "sonner";
import { VideoWithUser } from "./db/schema";

export const getUserInitials = (name: string): string => {
  if (name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  return "U";
};

export const handleShare = async (video: VideoWithUser) => {
  const shareUrl = `${window.location.origin}/video/${video.id}`;

  try {
    if (navigator.share && video.visibility === "public") {
      await navigator.share({
        title: video.title,
        text: video.description || undefined,
        url: shareUrl,
      });
      // toast.success("Shared successfully!");
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard!");
    }
  } catch (error) {
    if (error instanceof Error && error.name !== "AbortError") {
      toast.error("Failed to share video");
    }
  }
};

/**
 * Get array from sessionStorage
 */
export function getSessionArray<T>(key: string): T[] {
  if (typeof window === "undefined") return [];

  try {
    const item = sessionStorage.getItem(key);
    return item ? JSON.parse(item) : [];
  } catch {
    return [];
  }
}

/**
 * Save array to sessionStorage
 */
export function setSessionArray<T>(key: string, value: T[]): void {
  if (typeof window === "undefined") return;

  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error("Failed to save to sessionStorage");
  }
}
