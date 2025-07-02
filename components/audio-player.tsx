"use client"

import { useEffect, useRef, useState } from "react"

interface AudioPlayerProps {
  src: string
  autoPlay?: boolean
  onPlayPauseChange?: (isPlaying: boolean) => void
  onControlsReady?: (controls: AudioControls) => void
}

export type AudioControls = {
  togglePlayPause: () => void;
  skipForward: () => void;
  skipBackward?: () => void;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  seek: (time: number) => void;
}

export function AudioPlayer({ src, autoPlay = true, onPlayPauseChange, onControlsReady }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const STORAGE_KEY = `audio-position-${src}`

  const togglePlayPause = () => {
    try {
      if (audioRef.current) {
        if (isPlaying) {
          audioRef.current.pause();
        } else {
          audioRef.current.play();
        }
      }
    } catch (error) {
      console.error('Error en reproducción:', error);
      alert('Por favor haz click primero en el botón de play para iniciar');
    }
  };

  const skipForward = () => {
    const audioElement = audioRef.current
    if (!audioElement) return
    const newTime = Math.min(audioElement.currentTime + 150, audioElement.duration)
    audioElement.currentTime = newTime
    setCurrentTime(newTime)
    localStorage.setItem(STORAGE_KEY, newTime.toString())
  }

  const skipBackward = () => {
    const audioElement = audioRef.current
    if (!audioElement) return
    const newTime = Math.max(audioElement.currentTime - 150, 0)
    audioElement.currentTime = newTime
    setCurrentTime(newTime)
    localStorage.setItem(STORAGE_KEY, newTime.toString())
  }

  const seek = (time: number) => {
    const audioElement = audioRef.current
    if (!audioElement) return
    audioElement.currentTime = time
    setCurrentTime(time)
    localStorage.setItem(STORAGE_KEY, time.toString())
  }

  useEffect(() => {
    if (onControlsReady) {
      onControlsReady({
        togglePlayPause,
        skipForward,
        skipBackward,
        isPlaying,
        currentTime,
        duration,
        seek
      });
    }
  }, [isPlaying, onControlsReady, togglePlayPause, skipForward, skipBackward, currentTime, duration, seek]);

  useEffect(() => {
    const audioElement = audioRef.current
    if (!audioElement) return

    const handlePlay = () => {
      setIsPlaying(true)
      if (onPlayPauseChange) {
        onPlayPauseChange(true)
      }
    }

    const handlePause = () => {
      setIsPlaying(false)
      if (onPlayPauseChange) {
        onPlayPauseChange(false)
      }
    }

    const handleTimeUpdate = () => {
      setCurrentTime(audioElement.currentTime)
    }

    const handleLoadedMetadata = () => {
      setDuration(audioElement.duration)
    }

    audioElement.addEventListener('play', handlePlay)
    audioElement.addEventListener('pause', handlePause)
    audioElement.addEventListener('timeupdate', handleTimeUpdate)
    audioElement.addEventListener('loadedmetadata', handleLoadedMetadata)

    if (audioElement.paused) {
      if (isPlaying) {
        setIsPlaying(false)
        if (onPlayPauseChange) {
          onPlayPauseChange(false)
        }
      }
    } else {
      if (!isPlaying) {
        setIsPlaying(true)
        if (onPlayPauseChange) {
          onPlayPauseChange(true)
        }
      }
    }

    return () => {
      audioElement.removeEventListener('play', handlePlay)
      audioElement.removeEventListener('pause', handlePause)
      audioElement.removeEventListener('timeupdate', handleTimeUpdate)
      audioElement.removeEventListener('loadedmetadata', handleLoadedMetadata)
    }
  }, [onPlayPauseChange])

  useEffect(() => {
    const audioElement = audioRef.current
    if (!audioElement) return
    const savedPosition = localStorage.getItem(STORAGE_KEY)
    if (savedPosition) {
      const savedTime = parseFloat(savedPosition)
      audioElement.currentTime = savedTime
      setCurrentTime(savedTime)
    }
    if (audioElement.readyState >= 1) {
      setDuration(audioElement.duration);
    }
    const savePositionInterval = setInterval(() => {
      if (audioElement && !audioElement.paused) {
        localStorage.setItem(STORAGE_KEY, audioElement.currentTime.toString())
      }
    }, 5000)
    const handleBeforeUnload = () => {
      if (audioElement && !audioElement.paused) {
        localStorage.setItem(STORAGE_KEY, audioElement.currentTime.toString())
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
      clearInterval(savePositionInterval)
      if (audioElement && !audioElement.paused) {
        localStorage.setItem(STORAGE_KEY, audioElement.currentTime.toString())
      }
    }
  }, [STORAGE_KEY])

  return (
    <audio
      ref={audioRef}
      src={src}
      loop
      preload="auto"
      className="sr-only-audio"
      onError={() => {
        alert("Error al cargar el audio. Puede ser un problema de CORS, red o formato.");
        console.error('Audio src:', src);
      }}
      onPlay={() => {
        console.log('Audio play triggered', src);
      }}
    />
  )
}
