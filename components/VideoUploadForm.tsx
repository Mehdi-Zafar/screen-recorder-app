// components/ui/video-upload-form.tsx
"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TextInput from "./TextInput";
import TextareaInput from "./TextareaInput";
import FileInput, { FileInputRef } from "./FileInput"; // Your original component
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

// Back to File-based validation (like your original)
const formSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be less than 100 characters"),
  description: z
    .string()
    .min(1, "Description is required")
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must be less than 500 characters"),
  video: z
    .instanceof(File, { message: "Video file is required" })
    .refine(
      (file) => file.size <= 1000 * 1024 * 1024, // 1GB limit for UploadThing
      "Video must be less than 1GB"
    )
    .refine(
      (file) =>
        [
          "video/mp4",
          "video/avi",
          "video/mov",
          "video/wmv",
          "video/webm",
        ].includes(file.type),
      "Only MP4, AVI, MOV, WMV, and WebM formats are supported"
    ),
  thumbnail: z
    .instanceof(File, { message: "Thumbnail is required" })
    .refine(
      (file) => file.size <= 8 * 1024 * 1024, // 8MB limit for UploadThing
      "Thumbnail must be less than 8MB"
    )
    .refine(
      (file) =>
        ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(
          file.type
        ),
      "Only JPEG, PNG, and WebP formats are supported"
    ),
  visibility: z.enum(["public", "private"], {
    error: "Please select a visibility option",
  }),
});

type FormData = z.infer<typeof formSchema>;

// Main Form Component
export default function VideoUploadForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Refs to access upload functions
  const videoUploadRef = useRef<FileInputRef>(null);
  const thumbnailUploadRef = useRef<FileInputRef>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      visibility: "public",
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      console.log("Form data:", data);

      // Step 1: Upload files to UploadThing
      toast.info("Uploading files...");

      let videoUrl: string | null = null;
      let thumbnailUrl: string | null = null;
      let duration:number|null;

      // Upload video
      if (videoUploadRef.current) {
        try {
          videoUrl = await videoUploadRef.current.uploadFile();
          duration = await videoUploadRef.current.videoDuration()
          if (!videoUrl) {
            throw new Error("Video upload failed");
          }
          toast.success("Video uploaded successfully!");
        } catch (error) {
          toast.error("Video upload failed");
          throw error;
        }
      }

      // Upload thumbnail
      if (thumbnailUploadRef.current) {
        try {
          thumbnailUrl = await thumbnailUploadRef.current.uploadFile();
          if (!thumbnailUrl) {
            throw new Error("Thumbnail upload failed");
          }
          toast.success("Thumbnail uploaded successfully!");
        } catch (error) {
          toast.error("Thumbnail upload failed");
          throw error;
        }
      }

      // Step 2: Save metadata to your database
      toast.info("Saving video information...");

      const response = await fetch("/api/videos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: data.title,
          description: data.description,
          videoUrl,
          thumbnailUrl,
          duration,
          visibility: data.visibility,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save video information");
      }

      toast.success("Video uploaded and saved successfully!");
      // Original mode - send files as FormData
      // const formData = new FormData();
      // formData.append("title", data.title);
      // formData.append("description", data.description);
      // formData.append("video", data.video);
      // formData.append("thumbnail", data.thumbnail);
      // formData.append("visibility", data.visibility);

      // // Your original upload logic here
      // // await uploadVideo(formData);

      // alert("Video uploaded successfully!");

      form.reset();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Upload failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if any upload is in progress
  const isUploading =
    videoUploadRef.current?.isUploading ||
    thumbnailUploadRef.current?.isUploading;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Upload Video</h1>
        <p className="text-muted-foreground text-sm">
          Share your video with the world or keep it private.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Title Field */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title *</FormLabel>
                <FormControl>
                  <TextInput
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Enter video title"
                    error={form.formState.errors.title?.message}
                    maxLength={100}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Description Field */}
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description *</FormLabel>
                <FormControl>
                  <TextareaInput
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Describe your video content..."
                    error={form.formState.errors.description?.message}
                    maxLength={500}
                    rows={4}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Video Upload Field - Conditional rendering based on mode */}
          <FormField
            control={form.control}
            name="video"
            render={({ field: { onChange, value, ...field } }) => (
              <FormItem>
                <FormLabel>Video File *</FormLabel>
                <FormControl>
                  <FileInput
                    ref={videoUploadRef}
                    endpoint="videoUploader"
                    value={value}
                    onChange={onChange}
                    accept="video/*"
                    placeholder="Upload your video"
                    error={form.formState.errors.video?.message}
                  />
                </FormControl>
                <FormDescription>
                  Supported formats: MP4, AVI, MOV, WMV, WebM. Max size: 1GB.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Thumbnail Upload Field - Conditional rendering based on mode */}
          <FormField
            control={form.control}
            name="thumbnail"
            render={({ field: { onChange, value, ...field } }) => (
              <FormItem>
                <FormLabel>Thumbnail *</FormLabel>
                <FormControl>
                  <FileInput
                    ref={thumbnailUploadRef}
                    endpoint="thumbnailUploader"
                    value={value}
                    onChange={onChange}
                    accept="image/*"
                    placeholder="Upload thumbnail image"
                    error={form.formState.errors.thumbnail?.message}
                  />
                </FormControl>
                <FormDescription>
                  Choose an eye-catching thumbnail. Supported formats: JPEG,
                  PNG, WebP. Max size: 8MB.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Visibility Field - Select Version */}
          <FormField
            control={form.control}
            name="visibility"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Visibility *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select visibility">
                        <span className="capitalize font-medium">
                          {field.value}
                        </span>
                      </SelectValue>
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="public">
                      <div className="flex flex-col">
                        <span className="font-medium">Public</span>
                        <span className="text-sm text-muted-foreground">
                          Anyone can search for and view
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem value="private">
                      <div className="flex flex-col">
                        <span className="font-medium">Private</span>
                        <span className="text-sm text-muted-foreground">
                          Only you can view
                        </span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
              disabled={isSubmitting || isUploading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isUploading}>
              {isSubmitting || isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isUploading ? "Uploading..." : "Saving..."}
                </>
              ) : (
                "Upload Video"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
