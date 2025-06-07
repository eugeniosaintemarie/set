"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "./ui/button"

interface AudioPlayerProps {
  src: string
  autoPlay?: boolean
  onPlayPauseChange?: (isPlaying: boolean) => void
  onControlsReady?: (controls: AudioControls) => void
}

export type AudioControls = {
  togglePlayPause: () => void;
  skipForward: () => void;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  seek: (time: number) => void;
}

export function AudioPlayer({ src, autoPlay = true, onPlayPauseChange, onControlsReady }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false) // Cambiar autoPlay a false por defecto
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const STORAGE_KEY = `audio-position-${src}`

  // Función para pausar/reproducir el audio
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

  // Función para adelantar 2.5 minutos
  const skipForward = () => {
    const audioElement = audioRef.current
    if (!audioElement) return

    // Adelantar 2.5 minutos (150 segundos)
    const newTime = Math.min(audioElement.currentTime + 150, audioElement.duration)
    audioElement.currentTime = newTime
    setCurrentTime(newTime)
    // Guardar la nueva posición
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
    // Exponer los controles al componente padre
    if (onControlsReady) {
      onControlsReady({
        togglePlayPause,
        skipForward,
        isPlaying,
        currentTime,
        duration,
        seek
      });
    }
  }, [isPlaying, onControlsReady, togglePlayPause, skipForward, currentTime, duration, seek]); // Added togglePlayPause and skipForward for completeness if controls are recreated

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

    // Agregar event listeners para mantener el estado sincronizado
    audioElement.addEventListener('play', handlePlay)
    audioElement.addEventListener('pause', handlePause)
    audioElement.addEventListener('timeupdate', handleTimeUpdate)
    audioElement.addEventListener('loadedmetadata', handleLoadedMetadata)

    // Sincronizar el estado inicial en caso de que autoPlay sea falso o falle silenciosamente
    if (audioElement.paused) {
      if (isPlaying) { // Solo actualiza si el estado es incorrecto
        setIsPlaying(false)
        if (onPlayPauseChange) {
          onPlayPauseChange(false)
        }
      }
    } else {
      if (!isPlaying) { // Solo actualiza si el estado es incorrecto
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

    // Recuperar la posición guardada
    const savedPosition = localStorage.getItem(STORAGE_KEY)
    if (savedPosition) {
      const savedTime = parseFloat(savedPosition)
      audioElement.currentTime = savedTime
      setCurrentTime(savedTime)
    }
    // Ensure duration is set if metadata is already loaded
    if (audioElement.readyState >= 1) { // HAVE_METADATA
      setDuration(audioElement.duration);
    }

    // Guardar la posición actual cada 5 segundos
    const savePositionInterval = setInterval(() => {
      if (audioElement && !audioElement.paused) {
        localStorage.setItem(STORAGE_KEY, audioElement.currentTime.toString())
      }
    }, 5000)

    // Guardar la posición cuando se cierre o recargue la página
    const handleBeforeUnload = () => {
      if (audioElement && !audioElement.paused) {
        localStorage.setItem(STORAGE_KEY, audioElement.currentTime.toString())
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
      clearInterval(savePositionInterval)
      // Guardar la posición al desmontar el componente
      if (audioElement && !audioElement.paused) {
        localStorage.setItem(STORAGE_KEY, audioElement.currentTime.toString())
      }
    }
  }, [STORAGE_KEY])

  return (
    <div className="flex items-center gap-2">
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
      // controls // Quitamos los controles nativos
      />
      <Button onClick={() => {
        console.log('audioRef.current:', audioRef.current);
        togglePlayPause();
      }}>
        {isPlaying ? "Pause" : "Play"}
      </Button>
      <Button onClick={skipForward}>
        +2:30
      </Button>
      <span className="text-xs">
        {Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, '0')} / {Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, '0')}
      </span>
    </div>
  )
}
