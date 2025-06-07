"use client"

import { useEffect, useRef, useState } from "react"

interface AudioPlayerProps {
  src: string
  autoPlay?: boolean
}

export function AudioPlayer({ src, autoPlay = true }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const STORAGE_KEY = `audio-position-${src}`

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
          setIsPlaying(true)
        }
      } catch (error) {
        console.error("Auto-play failed:", error)
        setIsPlaying(false)
      }
    }

    playAudio()

    // Handle iOS/Safari restrictions by adding user interaction listener
    const handleUserInteraction = async () => {
      try {
        if (!isPlaying) {
          await audioElement.play()
          setIsPlaying(true)
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
  }, [autoPlay, isPlaying, STORAGE_KEY])

  return <audio ref={audioRef} src={src} loop preload="auto" className="hidden" />
}
