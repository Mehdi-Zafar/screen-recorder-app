// lib/uploadthing-utils.ts
import {
  generateUploadButton,
  generateUploadDropzone,
  generateReactHelpers,
} from "@uploadthing/react";

import type { OurFileRouter } from "@/lib/uploadthing";

export const UploadButton = generateUploadButton<OurFileRouter>();
export const UploadDropzone = generateUploadDropzone<OurFileRouter>();

export const { useUploadThing } = generateReactHelpers<OurFileRouter>();

// Type helpers for the different endpoints
export type UploadEndpoint = keyof OurFileRouter;

// Available endpoints:
// - "imageUploader" (your original, 4MB limit)
// - "videoUploader" (1GB limit, video only)  
// - "thumbnailUploader" (8MB limit, images only)
// - "mediaUploader" (combined: 8MB images, 1GB videos)