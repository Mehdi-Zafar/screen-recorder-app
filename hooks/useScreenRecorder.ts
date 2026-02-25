"use client";

import { useState, useRef, useCallback } from "react";
import { fixWebmDuration } from "@fix-webm-duration/fix";

export type RecordingState = "idle" | "recording" | "paused" | "stopped";

interface UseScreenRecorderReturn {
  state: RecordingState;
  isRecording: boolean;
  isPaused: boolean;
  recordedBlob: Blob | null;
  recordedFile: File | null;
  duration: number;
  actualDuration: number;
  error: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  resetRecording: () => void;
}

export function useScreenRecorder(): UseScreenRecorderReturn {
  const [state, setState] = useState<RecordingState>("idle");
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedFile, setRecordedFile] = useState<File | null>(null);
  const [duration, setDuration] = useState(0);
  const [actualDuration, setActualDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);
  const pausedDurationRef = useRef<number>(0);
  const pauseStartRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const durationRef = useRef<number>(0);
  const finalDurationRef = useRef<number>(0);
  const stateRef = useRef<RecordingState>("idle");

  const stopRecordingRef = useRef<() => void>(() => {});

  const setRecordingState = useCallback((next: RecordingState) => {
    stateRef.current = next;
    setState(next);
  }, []);

  const freezeTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    const elapsed = Date.now() - startTimeRef.current;
    const activeDuration = elapsed - pausedDurationRef.current;
    const finalSeconds = Math.floor(activeDuration / 1000);
    durationRef.current = finalSeconds;
    finalDurationRef.current = finalSeconds;
    setDuration(finalSeconds);
    return finalSeconds;
  }, []);

  const stopRecording = useCallback(() => {
    const currentState = stateRef.current;
    if (
      mediaRecorderRef.current &&
      (currentState === "recording" || currentState === "paused")
    ) {
      freezeTimer();
      mediaRecorderRef.current.stop();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    }
  }, [freezeTimer]);

  stopRecordingRef.current = stopRecording;

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      chunksRef.current = [];
      pausedDurationRef.current = 0;
      pauseStartRef.current = 0;
      durationRef.current = 0;
      finalDurationRef.current = 0;

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 },
        },
        audio: true,
      });

      streamRef.current = stream;

      let mimeType = "video/webm;codecs=vp9";
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = "video/webm;codecs=vp8";
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = "video/webm";
        }
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 2500000,
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const finalDurationSeconds = finalDurationRef.current;
        const finalDurationMs = finalDurationSeconds * 1000;

        stream.getTracks().forEach((track) => track.stop());

        const rawBlob = new Blob(chunksRef.current, { type: "video/webm" });
        const fixedBlob = await fixWebmDuration(rawBlob, finalDurationMs, {
          logger: false,
        });

        const file = new File(
          [fixedBlob],
          `screen-recording-${Date.now()}.webm`,
          { type: "video/webm" },
        );

        setRecordedBlob(fixedBlob);
        setRecordedFile(file);
        setActualDuration(finalDurationSeconds);
        setRecordingState("stopped");
      };

      stream.getVideoTracks()[0].onended = () => {
        stopRecordingRef.current();
      };

      mediaRecorder.start(1000);
      setRecordingState("recording");

      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        const activeDuration = elapsed - pausedDurationRef.current;
        const seconds = Math.floor(activeDuration / 1000);
        durationRef.current = seconds;
        setDuration(seconds);
      }, 1000);
    } catch (err: any) {
      if (err.name === "NotAllowedError") {
        setError("Permission denied. Please allow screen sharing.");
      } else if (err.name === "NotFoundError") {
        setError("No screen source found.");
      } else if (err.name === "NotSupportedError") {
        setError("Screen recording is not supported in your browser.");
      } else if (err.name === "AbortError") {
        setError("Screen sharing was cancelled.");
      } else {
        setError("Failed to start recording. Please try again.");
      }
      setRecordingState("idle");
    }
  }, [freezeTimer, setRecordingState]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && stateRef.current === "recording") {
      mediaRecorderRef.current.pause();
      setRecordingState("paused");
      pauseStartRef.current = Date.now();
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [setRecordingState]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && stateRef.current === "paused") {
      mediaRecorderRef.current.resume();
      setRecordingState("recording");
      const pauseDuration = Date.now() - pauseStartRef.current;
      pausedDurationRef.current += pauseDuration;
      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        const activeDuration = elapsed - pausedDurationRef.current;
        const seconds = Math.floor(activeDuration / 1000);
        durationRef.current = seconds;
        setDuration(seconds);
      }, 1000);
    }
  }, [setRecordingState]);

  const resetRecording = useCallback(() => {
    setRecordedBlob(null);
    setRecordedFile(null);
    setDuration(0);
    setActualDuration(0);
    setRecordingState("idle");
    setError(null);
    chunksRef.current = [];
    pausedDurationRef.current = 0;
    pauseStartRef.current = 0;
    durationRef.current = 0;
    finalDurationRef.current = 0;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, [setRecordingState]);

  return {
    state,
    isRecording: state === "recording",
    isPaused: state === "paused",
    recordedBlob,
    recordedFile,
    duration,
    actualDuration,
    error,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    resetRecording,
  };
}
