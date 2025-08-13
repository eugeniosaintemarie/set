"use client"

import { useWakeLock } from "@/hooks/use-wake-lock"
import { AudioPlayer, AudioControls } from "@/components/audio-player"
import { useEffect, useState, useRef } from "react"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpotify } from '@fortawesome/free-brands-svg-icons'

const formatTime = (timeInSeconds: number) => {
  if (isNaN(timeInSeconds) || timeInSeconds < 0) return "00:00:00";

  const hours = Math.floor(timeInSeconds / 3600);
  const minutes = Math.floor((timeInSeconds % 3600) / 60);
  const seconds = Math.floor(timeInSeconds % 60);

  return hours > 0
    ? `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    : `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export default function Home() {
  const { isSupported, isActive } = useWakeLock();
  const [audioControls, setAudioControls] = useState<AudioControls | null>(null);
  const [showSpotify, setShowSpotify] = useState(true);
  const [rotation, setRotation] = useState(0);
  const rotationRef = useRef<number>(0);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (isSupported) {
      console.log(`Wake lock is ${isActive ? "active" : "inactive"}`)
    } else {
      console.log("Wake lock is not supported on this device")
    }
  }, [isSupported, isActive])

  useEffect(() => {
    const interval = setInterval(() => {
      setShowSpotify((prev: boolean) => !prev)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const animate = () => {
      if (audioControls?.isPlaying) {
        rotationRef.current += 1
        setRotation(rotationRef.current)
        animationRef.current = requestAnimationFrame(animate)
      }
    }

    if (audioControls?.isPlaying) {
      animationRef.current = requestAnimationFrame(animate)
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [audioControls?.isPlaying])

  return (
    <>
      <div className="min-h-screen relative overflow-hidden">
        {/* ...tu contenido principal aquí... */}
      </div>
      <footer className="w-full text-center py-4 absolute bottom-0 left-0 z-50">
        <a
          href="https://eugeniosaintemarie.github.io"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-[#1DB954] transition-colors duration-200 font-mono text-sm select-none"
        >
          {"∃ugenio © "}{new Date().getFullYear()}
        </a>
      </footer>
    </>
  );
}

