"use client"

import { useState, useEffect } from "react"

export default function useForceRender(eventName: string) {
  const [, setTick] = useState(0)

  useEffect(() => {
    const handler = () => setTick((t) => t + 1)
    window.addEventListener(eventName, handler)
    return () => window.removeEventListener(eventName, handler)
  }, [eventName])
}
