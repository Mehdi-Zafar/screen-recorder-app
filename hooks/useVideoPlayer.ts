// /hooks/useVideoPlayer.ts
'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { VideoPlayerState } from '@/lib/types/video';

export function useVideoPlayer() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [state, setState] = useState<VideoPlayerState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    isMuted: false,
    isFullscreen: false,
    playbackRate: 1,
    buffered: 0,
    isWaiting: false,
  });

  // Play/Pause toggle
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    
    if (state.isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
  }, [state.isPlaying]);

  // Seek to specific time
  const seekTo = useCallback((time: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = time;
  }, []);

  // Skip forward/backward
  const skip = useCallback((seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime += seconds;
  }, []);

  // Volume control
  const setVolume = useCallback((volume: number) => {
    if (!videoRef.current) return;
    const clampedVolume = Math.max(0, Math.min(1, volume));
    videoRef.current.volume = clampedVolume;
    setState(prev => ({ ...prev, volume: clampedVolume, isMuted: clampedVolume === 0 }));
  }, []);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.muted = !state.isMuted;
    setState(prev => ({ ...prev, isMuted: !prev.isMuted }));
  }, [state.isMuted]);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(async () => {
    if (!videoRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await videoRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('Fullscreen error:', error);
    }
  }, []);

  // Set playback rate
  const setPlaybackRate = useCallback((rate: number) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = rate;
    setState(prev => ({ ...prev, playbackRate: rate }));
  }, []);

  // Picture-in-Picture
  const togglePictureInPicture = useCallback(async () => {
    if (!videoRef.current) return;

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (error) {
      console.error('PiP error:', error);
    }
  }, []);

  // Event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setState(prev => ({ ...prev, isPlaying: true }));
    const handlePause = () => setState(prev => ({ ...prev, isPlaying: false }));
    const handleTimeUpdate = () => {
      setState(prev => ({ ...prev, currentTime: video.currentTime }));
    };
    const handleDurationChange = () => {
      setState(prev => ({ ...prev, duration: video.duration }));
    };
    const handleVolumeChange = () => {
      setState(prev => ({ 
        ...prev, 
        volume: video.volume, 
        isMuted: video.muted 
      }));
    };
    const handleWaiting = () => setState(prev => ({ ...prev, isWaiting: true }));
    const handleCanPlay = () => setState(prev => ({ ...prev, isWaiting: false }));
    const handleProgress = () => {
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        const bufferedPercent = (bufferedEnd / video.duration) * 100;
        setState(prev => ({ ...prev, buffered: bufferedPercent }));
      }
    };

    const handleFullscreenChange = () => {
      setState(prev => ({ 
        ...prev, 
        isFullscreen: !!document.fullscreenElement 
      }));
    };

    // Add event listeners
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('durationchange', handleDurationChange);
    video.addEventListener('volumechange', handleVolumeChange);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('progress', handleProgress);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    // Cleanup
    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('durationchange', handleDurationChange);
      video.removeEventListener('volumechange', handleVolumeChange);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('progress', handleProgress);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Prevent default only for our shortcuts
      if (['Space', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'KeyF', 'KeyM', 'KeyP'].includes(e.code)) {
        e.preventDefault();
      }

      switch (e.code) {
        case 'Space':
          togglePlay();
          break;
        case 'ArrowLeft':
          skip(-10);
          break;
        case 'ArrowRight':
          skip(10);
          break;
        case 'ArrowUp':
          setVolume(state.volume + 0.1);
          break;
        case 'ArrowDown':
          setVolume(state.volume - 0.1);
          break;
        case 'KeyF':
          toggleFullscreen();
          break;
        case 'KeyM':
          toggleMute();
          break;
        case 'KeyP':
          togglePictureInPicture();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [togglePlay, skip, setVolume, toggleFullscreen, toggleMute, togglePictureInPicture, state.volume]);

  return {
    videoRef,
    state,
    actions: {
      togglePlay,
      seekTo,
      skip,
      setVolume,
      toggleMute,
      toggleFullscreen,
      setPlaybackRate,
      togglePictureInPicture,
    },
  };
}