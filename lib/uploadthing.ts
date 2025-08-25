import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { auth } from './auth';

const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: '4MB' } })
    .middleware(async ({ req }) => {
      const user = await auth.api.getSession({ headers: req.headers });
      if (!user) throw new Error('Unauthorized');
      return { userId: user.user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('Upload complete for userId:', metadata.userId);
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;