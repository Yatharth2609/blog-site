'use client'

import { useState, useEffect, useRef } from 'react'

/**
 * Types out text character by character.
 * @param text - The full string to type out
 * @param delay - Milliseconds between each character (default 40ms)
 * @param startDelay - Milliseconds to wait before starting (default 300ms)
 */
export function useTypewriter(
  text: string,
  delay: number = 40,
  startDelay: number = 300
): { displayed: string; isDone: boolean } {
  const [displayed, setDisplayed] = useState('')
  const [isDone, setIsDone] = useState(false)
  const indexRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    indexRef.current = 0
    setDisplayed('')
    setIsDone(false)

    const startTimer = setTimeout(() => {
      const tick = () => {
        if (indexRef.current < text.length) {
          indexRef.current += 1
          setDisplayed(text.slice(0, indexRef.current))
          timerRef.current = setTimeout(tick, delay)
        } else {
          setIsDone(true)
        }
      }
      tick()
    }, startDelay)

    return () => {
      clearTimeout(startTimer)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [text, delay, startDelay])

  return { displayed, isDone }
}
