// /app/record/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { useScreenRecorder } from "@/hooks/useScreenRecorder";
import VideoUploadForm from "@/components/VideoUploadForm";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Video,
  Square,
  Pause,
  Play,
  RotateCcw,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

export default function RecordPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  const {
    state,
    isRecording,
    isPaused,
    recordedFile,
    duration,
    actualDuration, // ✅ Get actual duration
    error,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    resetRecording,
  } = useScreenRecorder();

  const [showUploadForm, setShowUploadForm] = useState(false);
  const recordedObjectUrl = useMemo(() => {
    if (!recordedFile) return null;
    const url = URL.createObjectURL(recordedFile);
    return url;
  }, [recordedFile]);

  useEffect(() => {
    return () => {
      if (recordedObjectUrl) URL.revokeObjectURL(recordedObjectUrl);
    };
  }, [recordedObjectUrl]);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/auth/sign-in");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleProceedToUpload = () => {
    setShowUploadForm(true);
  };

  const handleDownload = () => {
    if (!recordedFile) return;

    const url = URL.createObjectURL(recordedFile);
    const link = document.createElement("a");
    link.href = url;
    link.download = recordedFile.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("Recording downloaded!");
  };

  const handleBackToRecording = () => {
    setShowUploadForm(false);
  };

  // ✅ Show upload form with VideoUploadForm component
  if (showUploadForm && recordedFile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <VideoUploadForm
          mode="recording"
          initialVideo={recordedFile}
          initialTitle={`Screen Recording ${new Date().toLocaleDateString()}`}
          initialDescription="Recorded with built-in screen recorder"
          recordedDuration={actualDuration} // ✅ Pass actual duration
          onBack={handleBackToRecording} // ✅ Pass back handler
        />
      </div>
    );
  }

  // ✅ Recording interface
  return (
    <div className="container mx-auto px-4 max-w-4xl py-8">
      <Card className="p-8">
        <div className="text-center space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Screen Recorder</h1>
            <p className="text-muted-foreground">
              Record your screen, window, or browser tab
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-4 bg-destructive/10 text-destructive rounded-lg">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          {(isRecording || isPaused || state === "stopped") && (
            <div className="space-y-4">
              <div className="text-6xl font-mono font-bold">
                {formatTime(duration)}
              </div>

              <div className="flex items-center justify-center gap-2">
                {isRecording && (
                  <>
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-sm font-medium">Recording...</span>
                  </>
                )}
                {isPaused && (
                  <>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                    <span className="text-sm font-medium">Paused</span>
                  </>
                )}
                {state === "stopped" && (
                  <>
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                    <span className="text-sm font-medium">
                      Recording Complete
                    </span>
                  </>
                )}
              </div>

              {recordedFile && (
                <p className="text-sm text-muted-foreground">
                  Size: {(recordedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              )}
            </div>
          )}

          {recordedFile && state === "stopped" && recordedObjectUrl && (
            <div className="mt-6">
              <video
                src={recordedObjectUrl}
                controls
                className="w-full max-w-2xl mx-auto rounded-lg border"
              />
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            {state === "idle" && (
              <Button onClick={startRecording} size="lg" className="gap-2">
                <Video className="w-5 h-5" />
                Start Recording
              </Button>
            )}

            {isRecording && (
              <>
                <Button
                  onClick={pauseRecording}
                  variant="outline"
                  size="lg"
                  className="gap-2"
                >
                  <Pause className="w-5 h-5" />
                  Pause
                </Button>

                <Button
                  onClick={stopRecording}
                  variant="destructive"
                  size="lg"
                  className="gap-2"
                >
                  <Square className="w-5 h-5" />
                  Stop Recording
                </Button>
              </>
            )}

            {isPaused && (
              <>
                <Button
                  onClick={resumeRecording}
                  variant="outline"
                  size="lg"
                  className="gap-2"
                >
                  <Play className="w-5 h-5" />
                  Resume
                </Button>

                <Button
                  onClick={stopRecording}
                  variant="destructive"
                  size="lg"
                  className="gap-2"
                >
                  <Square className="w-5 h-5" />
                  Stop
                </Button>
              </>
            )}

            {state === "stopped" && recordedFile && (
              <>
                <Button
                  onClick={handleProceedToUpload}
                  size="lg"
                  className="gap-2"
                >
                  Continue to Upload
                  <ArrowRight className="w-5 h-5" />
                </Button>

                <Button
                  onClick={handleDownload}
                  variant="outline"
                  size="lg"
                  className="gap-2"
                >
                  <Video className="w-5 h-5" />
                  Download
                </Button>

                <Button
                  onClick={resetRecording}
                  variant="ghost"
                  size="lg"
                  className="gap-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  New Recording
                </Button>
              </>
            )}
          </div>

          {state === "idle" && (
            <div className="mt-8 text-left bg-muted p-6 rounded-lg space-y-3">
              <h3 className="font-semibold text-lg">How it works:</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>Click &quot;Start Recording&quot; button</li>
                <li>
                  Choose what to share: entire screen, window, or browser tab
                </li>
                <li>Click &quot;Share&quot; in the browser popup</li>
                <li>Recording starts automatically</li>
                <li>Click &quot;Stop Recording&quot; when done</li>
                <li>Preview and continue to upload</li>
              </ol>
              <p className="text-xs text-muted-foreground mt-4">
                💡 Tip: For best quality, close unnecessary apps and use a
                stable internet connection.
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
