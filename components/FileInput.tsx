// components/ui/UploadThingFileInput.tsx
"use client";

import { Upload, X, CheckCircle, Loader2 } from "lucide-react";
import { useState, useImperativeHandle, forwardRef } from "react";
import { useUploadThing } from "@/lib/uploadthing-utils";
import { Button } from "./ui/button";
import { getVideoDuration } from "@/lib/utils";

interface UploadThingFileInputProps {
  endpoint: "videoUploader" | "thumbnailUploader" | "imageUploader" | "mediaUploader";
  value?: File; // Now takes File like your original component
  onChange: (file: File | undefined) => void; // Now handles File like your original
  accept: string;
  placeholder: string;
  error?: string;
}

export interface FileInputRef {
  uploadFile: () => Promise<string | null>;
  isUploading: boolean;
  videoDuration:()=>Promise<number>|null;
}

const UploadThingFileInput = forwardRef<FileInputRef, UploadThingFileInputProps>(({
  endpoint,
  value,
  onChange,
  accept,
  placeholder,
  error,
}, ref) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isCurrentlyUploading, setIsCurrentlyUploading] = useState(false);

  const { startUpload } = useUploadThing(endpoint, {
    onClientUploadComplete: (res) => {
      // Don't do anything here - let the parent handle the result
    },
    onUploadError: (error) => {
      console.error("Upload error:", error);
      setIsCurrentlyUploading(false);
      setUploadProgress(0);
      throw error; // Re-throw to let parent handle
    },
    onUploadProgress: (progress) => {
      setUploadProgress(progress);
    },
  });

  // Expose upload function to parent via ref
  useImperativeHandle(ref, () => ({
    uploadFile: async (): Promise<string | null> => {
      if (!value) return null;
      
      setIsCurrentlyUploading(true);
      setUploadProgress(0);
      
      try {
        const result = await startUpload([value]);
        setIsCurrentlyUploading(false);
        setUploadProgress(0);
        
        if (result && result[0]) {
          return result[0].url;
        }
        return null;
      } catch (error) {
        setIsCurrentlyUploading(false);
        setUploadProgress(0);
        throw error;
      }
    },
    isUploading: isCurrentlyUploading,
    videoDuration:async():Promise<number>=>{
      if (endpoint !== "videoUploader") return null;
      if (!value) return 0;
      return await getVideoDuration(value);
    }
  }));

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onChange(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onChange(e.target.files[0]);
    }
  };

  const removeFile = () => {
    onChange(undefined);
    setUploadProgress(0);
  };

  return (
    <div
      className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
        dragActive
          ? "border-primary bg-primary/5"
          : error
            ? "border-destructive"
            : "border-muted-foreground/25 hover:border-primary/50"
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept={accept}
        onChange={handleChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={isCurrentlyUploading}
      />

      {isCurrentlyUploading ? (
        // Upload progress state - matches your existing design but with progress
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 text-primary animate-spin" />
              <span className="text-sm font-medium truncate max-w-[200px]">
                {value?.name}
              </span>
              {value && (
                <span className="text-xs text-muted-foreground">
                  ({(value.size / 1024 / 1024).toFixed(2)} MB)
                </span>
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              {uploadProgress.toFixed(0)}%
            </span>
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      ) : value ? (
        // File selected state - exactly matches your existing design
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Upload className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium truncate max-w-[200px]">
              {value.name}
            </span>
            <span className="text-xs text-muted-foreground">
              ({(value.size / 1024 / 1024).toFixed(2)} MB)
            </span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={removeFile}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        // Default state - exactly matches your existing design
        <div className="text-center">
          <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-sm font-medium">{placeholder}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Drag and drop or click to browse
          </p>
        </div>
      )}
    </div>
  );
});

UploadThingFileInput.displayName = "UploadThingFileInput";

export default UploadThingFileInput;