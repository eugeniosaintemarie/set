"use client"

import { useState, useEffect } from "react"

export function useWakeLock() {
  const [isSupported, setIsSupported] = useState<boolean>(false)
  const [wakeLock, setWakeLock] = useState<WakeLockSentinel | null>(null)

  useEffect(() => {
    if ("wakeLock" in navigator) {
      setIsSupported(true)
    }
  }, [])

  useEffect(() => {
    let wakeLockSentinel: WakeLockSentinel | null = null

    const requestWakeLock = async () => {
      try {
        if ("wakeLock" in navigator) {
          wakeLockSentinel = await (navigator as any).wakeLock.request("screen")
          setWakeLock(wakeLockSentinel)

          wakeLockSentinel.addEventListener("release", () => {
            setWakeLock(null)
          })

          console.log("Wake Lock is active")
        }
      } catch (err: any) {
        if (err.name === "NotAllowedError") {
          console.log("Wake Lock permission denied - continuing without wake lock")
        } else if (err.name === "NotSupportedError") {
          console.log("Wake Lock not supported on this device")
        } else {
          console.log("Wake Lock failed:", err.message)
        }
        setWakeLock(null)
      }
    }

    requestWakeLock()

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        requestWakeLock()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      if (wakeLockSentinel) {
        wakeLockSentinel.release().catch((err) => {
          console.log("Wake lock release failed:", err.message)
        })
      }
    }
  }, [])

  return { isSupported, isActive: !!wakeLock }
}
