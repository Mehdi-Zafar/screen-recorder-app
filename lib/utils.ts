import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function timeAgo(date: Date | string | number): string {
    const now = new Date();
    const inputDate = typeof date === 'string' || typeof date === 'number' 
        ? new Date(date) 
        : date;
    
    const seconds = Math.floor((now.getTime() - inputDate.getTime()) / 1000);
    
    let interval = seconds / 31536000; // seconds in a year
    
    if (interval > 1) {
        const years = Math.floor(interval);
        return years + (years === 1 ? ' year ago' : ' years ago');
    }
    
    interval = seconds / 2592000; // seconds in a month (approx 30 days)
    if (interval > 1) {
        const months = Math.floor(interval);
        return months + (months === 1 ? ' month ago' : ' months ago');
    }
    
    interval = seconds / 86400; // seconds in a day
    if (interval > 1) {
        const days = Math.floor(interval);
        return days + (days === 1 ? ' day ago' : ' days ago');
    }
    
    interval = seconds / 3600; // seconds in an hour
    if (interval > 1) {
        const hours = Math.floor(interval);
        return hours + (hours === 1 ? ' hour ago' : ' hours ago');
    }
    
    interval = seconds / 60; // seconds in a minute
    if (interval > 1) {
        const minutes = Math.floor(interval);
        return minutes + (minutes === 1 ? ' minute ago' : ' minutes ago');
    }
    
    return Math.floor(seconds) + (seconds === 1 ? ' second ago' : ' seconds ago');
}

export async function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";

    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src); // cleanup
      resolve(Math.floor(video.duration)); // in seconds
    };

    video.onerror = (err) => {
      reject(err);
    };

    video.src = URL.createObjectURL(file);
  });
}

export function formatDuration(seconds: number) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  return hrs > 0
    ? `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    : `${mins}:${secs.toString().padStart(2, "0")}`;
}