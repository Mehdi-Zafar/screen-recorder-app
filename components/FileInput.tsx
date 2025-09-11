"use client";

import { Upload, X } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";

// Custom File Input Component
interface FileInputProps {
  value?: File;
  onChange: (file: File | undefined) => void;
  accept: string;
  placeholder: string;
  error?: string;
}

export default function FileInput({
  value,
  onChange,
  accept,
  placeholder,
  error,
}: FileInputProps) {
  const [dragActive, setDragActive] = useState(false);

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
      />

      {value ? (
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
}
