// lib/uploadthing.ts
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "./auth";

const f = createUploadthing();

export const ourFileRouter = {
  // Keep your existing imageUploader for backward compatibility
  imageUploader: f({ image: { maxFileSize: "4MB" } })
    .middleware(async ({ req }) => {
      const user = await auth.api.getSession({ headers: req.headers });
      if (!user) throw new Error("Unauthorized");
      return { userId: user.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { uploadedBy: metadata.userId };
    }),

  // New video uploader for large video files
  videoUploader: f({
    video: {
      maxFileSize: "1GB", // Large size for video files
      maxFileCount: 1,
      acl: "public-read", // Adjust based on your needs
    },
  })
    .middleware(async ({ req }) => {
      const user = await auth.api.getSession({ headers: req.headers });
      if (!user) throw new Error("Unauthorized");
      return {
        userId: user.user.id,
        userEmail: user.user.email,
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {

      return {
        uploadedBy: metadata.userId,
        url: file.url,
        fileName: file.name,
        fileSize: file.size,
      };
    }),

  // Dedicated thumbnail uploader (higher quality than regular images)
  thumbnailUploader: f({
    image: {
      maxFileSize: "8MB", // Higher limit for quality thumbnails
      maxFileCount: 1,
      acl: "public-read",
    },
  })
    .middleware(async ({ req }) => {
      const user = await auth.api.getSession({ headers: req.headers });
      if (!user) throw new Error("Unauthorized");
      return {
        userId: user.user.id,
        userEmail: user.user.email,
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {

      return {
        uploadedBy: metadata.userId,
        url: file.url,
        fileName: file.name,
      };
    }),

  // Optional: Combined media uploader (if you want one endpoint for both)
  mediaUploader: f({
    image: { maxFileSize: "8MB", maxFileCount: 1 },
    video: { maxFileSize: "1GB", maxFileCount: 1 },
  })
    .middleware(async ({ req }) => {
      const user = await auth.api.getSession({ headers: req.headers });
      if (!user) throw new Error("Unauthorized");
      return {
        userId: user.user.id,
        userEmail: user.user.email,
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const fileType = file.type.startsWith("video/") ? "video" : "image";

      return {
        uploadedBy: metadata.userId,
        url: file.url,
        fileName: file.name,
        fileSize: file.size,
        fileType,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
