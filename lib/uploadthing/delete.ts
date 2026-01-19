import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

/**
 * Extract file key from UploadThing URL
 * Example: https://utfs.io/f/abc123-def456.mp4 -> abc123-def456.mp4
 */
function getFileKeyFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split("/");
    return pathParts[pathParts.length - 1]; // Get last part (filename)
  } catch (error) {
    console.error("Invalid URL:", url);
    return null;
  }
}

/**
 * Delete a single file from UploadThing
 */
export async function deleteUploadThingFile(fileUrl: string): Promise<boolean> {
  try {
    const fileKey = getFileKeyFromUrl(fileUrl);

    if (!fileKey) {
      console.error("Could not extract file key from URL:", fileUrl);
      return false;
    }

    console.log(`🗑️ Deleting file from UploadThing: ${fileKey}`);

    await utapi.deleteFiles(fileKey);

    console.log(`✅ Successfully deleted: ${fileKey}`);
    return true;
  } catch (error) {
    console.error("❌ Failed to delete file from UploadThing:", error);
    return false;
  }
}

/**
 * Delete multiple files from UploadThing
 */
export async function deleteUploadThingFiles(
  fileUrls: string[],
): Promise<boolean> {
  try {
    const fileKeys = fileUrls
      .map((url) => getFileKeyFromUrl(url))
      .filter((key): key is string => key !== null);

    if (fileKeys.length === 0) {
      console.warn("No valid file keys to delete");
      return false;
    }

    console.log(`🗑️ Deleting ${fileKeys.length} files from UploadThing`);

    await utapi.deleteFiles(fileKeys);

    console.log(`✅ Successfully deleted ${fileKeys.length} files`);
    return true;
  } catch (error) {
    console.error("❌ Failed to delete files from UploadThing:", error);
    return false;
  }
}

/**
 * Delete video and thumbnail from UploadThing
 */
export async function deleteVideoFiles(
  videoUrl: string,
  thumbnailUrl?: string,
): Promise<void> {
  const filesToDelete: string[] = [videoUrl];

  if (thumbnailUrl) {
    filesToDelete.push(thumbnailUrl);
  }

  await deleteUploadThingFiles(filesToDelete);
}
