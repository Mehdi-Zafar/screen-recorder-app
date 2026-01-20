// /hooks/useVideoMutations.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  updateVideoVisibility,
  deleteVideo,
} from "@/lib/actions/video.actions";
import type { VideoWithUser } from "@/lib/db/schema";
import { QueryKey } from "@/lib/constants";

interface UseVideoMutationsOptions {
  queryKey: string[];
  onDeleteSuccess?: () => void;
  redirectOnDelete?: boolean;
  redirectPath?: string;
}

export function useVideoMutations({
  queryKey,
  onDeleteSuccess,
  redirectOnDelete = false,
  redirectPath = "/",
}: UseVideoMutationsOptions) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();

  // ✅ Update visibility mutation
  const visibilityMutation = useMutation({
    mutationFn: ({
      videoId,
      visibility,
    }: {
      videoId: string;
      visibility: "public" | "private";
    }) => updateVideoVisibility(videoId, visibility),

    onMutate: async ({ videoId, visibility }) => {
      const toastId = toast.loading(
        `Making video ${visibility === "public" ? "public" : "private"}...`,
      );
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData(queryKey);

      // Optimistic update
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old?.pages) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            videos: page.videos.map((v: VideoWithUser) =>
              v.id === videoId ? { ...v, visibility } : v,
            ),
          })),
        };
      });

      return { previousData, toastId, visibility };
    },

    onError: (error: any, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      if (context?.toastId) {
        toast.dismiss(context.toastId);
      }
      toast.error(error?.error || "Failed to update visibility");
    },

    onSuccess: (data, variables, context) => {
      if (context?.toastId) {
        toast.dismiss(context.toastId);
      }
      if (data.success) {
        toast.success(data.message || "Visibility updated successfully");
        queryClient.removeQueries({ queryKey: [QueryKey.VIDEOS] });
      } else {
        toast.error(data.error || "Failed to update visibility");
      }
    },
  });

  // ✅ Delete video mutation
  const deleteMutation = useMutation({
    mutationFn: (videoId: string) => deleteVideo(videoId),
    onMutate: async (videoId) => {
      const toastId = toast.loading("Deleting video");

      if (!redirectOnDelete) {
        await queryClient.cancelQueries({ queryKey });
        const previousData = queryClient.getQueryData(queryKey);

        // Optimistic removal
        queryClient.setQueryData(queryKey, (old: any) => {
          if (!old?.pages) return old;
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              videos: page.videos.filter(
                (v: VideoWithUser) => v.id !== videoId,
              ),
            })),
          };
        });

        return { previousData, toastId };
      }
      return { previousData: null, toastId };
    },

    onError: (error: any, variables, context) => {
      if (context?.previousData && !redirectOnDelete) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      if (context?.toastId) {
        toast.dismiss(context.toastId);
      }
      toast.error(error?.error || "Failed to delete video");
    },

    onSuccess: async (data, variables, context) => {
      if (context?.toastId) {
        toast.dismiss(context.toastId);
      }
      if (data.success) {
        toast.success(data.message || "Video deleted successfully");

        if (redirectOnDelete) {
          queryClient.removeQueries({ queryKey: [QueryKey.VIDEOS] });
          router.push(redirectPath);
          router.refresh();
        }
      } else {
        toast.error(data.error || "Failed to delete video");
      }
    },
  });

  return {
    visibilityMutation,
    deleteMutation,
  };
}
