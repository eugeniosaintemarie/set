"use client"

import { useWakeLock } from "@/hooks/use-wake-lock"
import { AudioPlayer, AudioControls } from "@/components/audio-player"
import { useEffect, useState } from "react"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpotify } from '@fortawesome/free-brands-svg-icons'

// Función para formatear el tiempo en HH:MM:SS
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
  const { isSupported, isActive } = useWakeLock()
  const [audioControls, setAudioControls] = useState<AudioControls | null>(null)

  useEffect(() => {
    // Log wake lock status
    if (isSupported) {
      console.log(`Wake lock is ${isActive ? "active" : "inactive"}`)
    } else {
      console.log("Wake lock is not supported on this device")
    }
  }, [isSupported, isActive])

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Fondo con blur */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url(/butterfly-bg.jpg)",
          filter: "blur(2.5px)",
        }}
      ></div>

      {/* Overlay para mejorar contraste */}
      <div className="absolute inset-0 bg-black bg-opacity-20"></div>

      {/* Contenido principal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        {/* Audio player (hidden) */}
        <AudioPlayer 
          src="https://archive.org/download/set_20250607/set.mp3"
          autoPlay={true} 
          onControlsReady={setAudioControls}
        />

        {/* Username in top right */}
        <div className="absolute top-4 right-4 text-[#1DB954] text-sm md:text-base font-roboto">
          <FontAwesomeIcon icon={faSpotify} className="mr-2" />
          @eugenio<span className="underline">sainte</span>marie
        </div>

        <div className="relative flex flex-col items-center">
          {/* CD exterior */}
          <div className="w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-full bg-white border-4 border-gray-300 shadow-2xl animate-spin-slow relative overflow-hidden opacity-90">
            {/* Círculo interior del CD */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-gray-800 shadow-inner border-2 border-gray-600"></div>

            {/* Texto "cachengue" que gira con el CD */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48">
                <svg className="w-full h-full" viewBox="0 0 200 200">
                  <defs>
                    <path id="circle-path" d="M 100, 100 m -75, 0 a 75,75 0 1,1 150,0 a 75,75 0 1,1 -150,0" />
                  </defs>
                  <text className="text-lg sm:text-xl md:text-2xl font-bold fill-gray-700 tracking-widest">
                    <textPath href="#circle-path" startOffset="0%">
                      {"</ >"}
                    </textPath>
                  </text>
                </svg>
              </div>
            </div>
          </div>

          {/* Reflejo del CD */}
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-64 h-8 sm:w-80 sm:h-10 md:w-96 md:h-12 bg-gradient-to-b from-gray-800 to-transparent rounded-full opacity-30 blur-sm"></div>
          
          {/* Controles de audio y barra de progreso */}
          <div className="mt-8 flex space-x-6 items-center">
            <button 
              onClick={() => audioControls?.togglePlayPause()}
              className="bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-800 rounded-full p-3 shadow-lg transition-all duration-300 transform hover:scale-105"
              aria-label={audioControls?.isPlaying ? "Pausar" : "Reproducir"}
            >
              <span className="text-xl font-bold">
                {audioControls?.isPlaying ? "⏸" : "▶"}
              </span>
            </button>
            
            <button 
              onClick={() => audioControls?.skipForward()}
              className="bg-white bg-opacity-80 hover:bg-opacity-100 text-gray-800 rounded-full p-3 shadow-lg transition-all duration-300 transform hover:scale-105"
              aria-label="Adelantar 2:30 minutos"
            >
              <span className="text-xl font-bold">⏭ </span>
            </button>
          </div>

          {/* Barra de progreso y tiempo */}
          {audioControls && audioControls.duration > 0 && (
            <div className="mt-6 w-64 sm:w-80 md:w-96">
              <input 
                type="range"
                min="0"
                max={audioControls.duration}
                value={audioControls.currentTime}
                onChange={(e) => audioControls.seek(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 [&::-webkit-slider-thumb]:bg-[#1DB954] [&::-moz-range-thumb]:bg-[#1DB954]" style={{accentColor: '#1DB954'}}
              />
              <div className="flex justify-between text-xs text-white mt-1 font-roboto">
                <span>{formatTime(audioControls.currentTime)}</span>
                <span>{formatTime(audioControls.duration)}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
