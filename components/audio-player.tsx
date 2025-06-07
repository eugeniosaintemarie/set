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
  isPlaying: boolean;
}

export function AudioPlayer({ src, autoPlay = true, onPlayPauseChange, onControlsReady }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const STORAGE_KEY = `audio-position-${src}`

  // Función para pausar/reproducir el audio
  const togglePlayPause = () => {
    const audioElement = audioRef.current
    if (!audioElement) return

    if (audioElement.paused) {
      audioElement.play().catch(error => {
        console.error("Play failed:", error)
        // The 'play' event listener will handle setIsPlaying(true) and onPlayPauseChange
      })
    } else {
      audioElement.pause()
      // The 'pause' event listener will handle setIsPlaying(false) and onPlayPauseChange
    }
    // No need to call setIsPlaying or onPlayPauseChange here,
    // as the event listeners will take care of it.
  }

  // Función para adelantar 2.5 minutos
  const skipForward = () => {
    const audioElement = audioRef.current
    if (!audioElement) return
    
    // Adelantar 2.5 minutos (150 segundos)
    audioElement.currentTime = Math.min(audioElement.currentTime + 150, audioElement.duration)
    
    // Guardar la nueva posición
    localStorage.setItem(STORAGE_KEY, audioElement.currentTime.toString())
  }

  useEffect(() => {
    // Exponer los controles al componente padre
    if (onControlsReady) {
      onControlsReady({
        togglePlayPause,
        skipForward,
        isPlaying
      });
    }
  }, [isPlaying, onControlsReady, togglePlayPause, skipForward]); // Added togglePlayPause and skipForward for completeness if controls are recreated

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

    // Agregar event listeners para mantener el estado sincronizado
    audioElement.addEventListener('play', handlePlay)
    audioElement.addEventListener('pause', handlePause)

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
    }
  }, [onPlayPauseChange])

  useEffect(() => {
    const audioElement = audioRef.current
    if (!audioElement) return

    // Recuperar la posición guardada
    const savedPosition = localStorage.getItem(STORAGE_KEY)
    if (savedPosition) {
      audioElement.currentTime = parseFloat(savedPosition)
    }

    const playAudio = async () => {
      try {
        if (autoPlay) {
          // Try to play audio automatically
          await audioElement.play()
          // setIsPlaying and onPlayPauseChange will be handled by the 'play' event listener
        }
      } catch (error) {
        console.error("Auto-play failed:", error)
        // setIsPlaying and onPlayPauseChange will be handled by the 'pause' event listener or initial state check
      }
    }

    playAudio()

    // Handle iOS/Safari restrictions by adding user interaction listener
    const handleUserInteraction = async () => {
      try {
        if (audioElement.paused) { // Check audioElement.paused directly
          await audioElement.play()
          // setIsPlaying and onPlayPauseChange will be handled by the 'play' event listener
        }
      } catch (error) {
        console.error("Play failed after user interaction:", error)
      }
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

    document.addEventListener("click", handleUserInteraction, { once: true })
    document.addEventListener("touchstart", handleUserInteraction, { once: true })
    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      document.removeEventListener("click", handleUserInteraction)
      document.removeEventListener("touchstart", handleUserInteraction)
      window.removeEventListener("beforeunload", handleBeforeUnload)
      clearInterval(savePositionInterval)
      
      // Guardar la posición al desmontar el componente
      if (audioElement && !audioElement.paused) {
        localStorage.setItem(STORAGE_KEY, audioElement.currentTime.toString())
      }
    }
  }, [autoPlay, STORAGE_KEY, onPlayPauseChange]) // Removed isPlaying as it's managed by its own effect

  return (
    <>
      <audio ref={audioRef} src={src} loop preload="auto" className="hidden" />
    </>
  )
}
