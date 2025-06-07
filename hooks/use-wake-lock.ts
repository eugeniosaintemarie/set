"use client"

import { useState, useEffect } from "react"

export function useWakeLock() {
  const [isSupported, setIsSupported] = useState<boolean>(false)
  const [wakeLock, setWakeLock] = useState<WakeLockSentinel | null>(null)

  useEffect(() => {
    // Check if the Wake Lock API is supported
    if ("wakeLock" in navigator) {
      setIsSupported(true)
    }
  }, [])

  useEffect(() => {
    let wakeLockSentinel: WakeLockSentinel | null = null

    const requestWakeLock = async () => {
      try {
        if ("wakeLock" in navigator) {
          // Request a screen wake lock
          wakeLockSentinel = await (navigator as any).wakeLock.request("screen")
          setWakeLock(wakeLockSentinel)

          // Add event listener for when the wake lock is released
          wakeLockSentinel.addEventListener("release", () => {
            setWakeLock(null)
          })

          console.log("Wake Lock is active")
        }
      } catch (err: any) {
        // Handle specific permission errors gracefully
        if (err.name === "NotAllowedError") {
          console.log("Wake Lock permission denied - continuing without wake lock")
        } else if (err.name === "NotSupportedError") {
          console.log("Wake Lock not supported on this device")
        } else {
          console.log("Wake Lock failed:", err.message)
        }
        // Don't throw the error, just continue without wake lock
        setWakeLock(null)
      }
    }

    // Request wake lock when component mounts
    requestWakeLock()

    // Re-request wake lock when document becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        requestWakeLock()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    // Clean up
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      if (wakeLockSentinel) {
        wakeLockSentinel.release().catch((err) => {
          // Silently handle release errors
          console.log("Wake lock release failed:", err.message)
        })
      }
    }
  }, [])

  return { isSupported, isActive: !!wakeLock }
}
