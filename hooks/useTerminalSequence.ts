'use client'

import { useState, useEffect, useRef } from 'react'

export interface TerminalLine {
  type: 'cmd' | 'output' | 'blank'
  text: string
}

export interface TerminalBlock {
  command: string
  output: string[]   // each string = one output line
  speed?: number     // chars/ms for command typing
}

interface UseTerminalSequenceResult {
  visibleLines: TerminalLine[]
  isComplete: boolean
  currentBlock: number
}

/**
 * Drives a full terminal sequence:
 * For each block: type the command char-by-char, pause, then reveal
 * output lines one by one, then move to the next block.
 */
export function useTerminalSequence(
  blocks: TerminalBlock[],
  opts: {
    cmdSpeed?: number        // ms per char while typing command (default 35)
    cmdPause?: number        // ms pause before output appears (default 180)
    outputLineDelay?: number // ms between each output line (default 80)
    blockDelay?: number      // ms between blocks (default 400)
    startDelay?: number      // ms before first block starts (default 600)
  } = {}
): UseTerminalSequenceResult {
  const {
    cmdSpeed       = 35,
    cmdPause       = 180,
    outputLineDelay = 80,
    blockDelay     = 420,
    startDelay     = 600,
  } = opts

  const [visibleLines, setVisibleLines] = useState<TerminalLine[]>([])
  const [isComplete,   setIsComplete]   = useState(false)
  const [currentBlock, setCurrentBlock] = useState(-1)

  // Accumulate lines immutably — append only
  const append = (line: TerminalLine) =>
    setVisibleLines(prev => [...prev, line])

  const appendCmd = (text: string) => append({ type: 'cmd', text })
  const appendOut = (text: string) => append({ type: 'output', text })
  const appendBlank = ()           => append({ type: 'blank', text: '' })

  useEffect(() => {
    if (blocks.length === 0) return
    let cancelled = false
    let timeouts: ReturnType<typeof setTimeout>[] = []

    function schedule(fn: () => void, delay: number) {
      const t = setTimeout(() => { if (!cancelled) fn() }, delay)
      timeouts.push(t)
      return t
    }

    async function runBlock(blockIdx: number, offset: number): Promise<number> {
      if (cancelled) return offset
      const block = blocks[blockIdx]
      if (!block) return offset

      setCurrentBlock(blockIdx)

      // ── 1. Type command char by char ────────────────────────────────────
      const cmd = `$ ${block.command}`
      let t = offset

      // Start with the prompt prefix placed immediately
      for (let i = 0; i <= cmd.length; i++) {
        const slice = cmd.slice(0, i)
        ;((captured: string, delay: number) => {
          schedule(() => {
            setVisibleLines(prev => {
              // Replace or append the current cmd line
              const rest = prev.filter((_, idx) => !(idx === prev.length - 1 && prev[prev.length - 1]?.type === 'cmd'))
              return [...rest, { type: 'cmd', text: captured }]
            })
          }, delay)
        })(slice, t)
        t += cmdSpeed
      }

      // ── 2. Pause before output ───────────────────────────────────────────
      t += cmdPause

      // ── 3. Append output lines ───────────────────────────────────────────
      for (let j = 0; j < block.output.length; j++) {
        const line = block.output[j]
        ;((l: string, delay: number) => {
          schedule(() => appendOut(l), delay)
        })(line, t)
        t += outputLineDelay
      }

      // ── 4. Blank line + move to next block ───────────────────────────────
      t += blockDelay
      schedule(() => appendBlank(), t)
      t += 40

      return t
    }

    async function runAll() {
      schedule(() => appendBlank(), 0)  // initial blank
      let cursor = startDelay

      for (let i = 0; i < blocks.length; i++) {
        // Seed the cmd line slot so it exists before typing starts
        ;((idx: number, delay: number) => {
          schedule(() => {
            setVisibleLines(prev => [...prev, { type: 'cmd', text: '$ ' }])
            setCurrentBlock(idx)
          }, delay)
        })(i, cursor)
        cursor += 40

        // Calculate end time for this block
        const block = blocks[i]
        const cmdLen = (`$ ${block.command}`).length
        const totalCmd   = cmdLen * cmdSpeed
        const totalOut   = block.output.length * outputLineDelay
        const filler     = cmdPause + blockDelay + 80

        // Animate command typing
        const cmd = `$ ${block.command}`
        for (let ci = 1; ci <= cmd.length; ci++) {
          ;((slice: string, delay: number) => {
            schedule(() => {
              setVisibleLines(prev => {
                if (prev.length === 0) return prev
                const updated = [...prev]
                updated[updated.length - 1] = { type: 'cmd', text: slice }
                return updated
              })
            }, delay)
          })(cmd.slice(0, ci), cursor + ci * cmdSpeed)
        }
        cursor += totalCmd + 40

        // Pause then output
        cursor += cmdPause
        for (let oi = 0; oi < block.output.length; oi++) {
          ;((line: string, delay: number) => {
            schedule(() => appendOut(line), delay)
          })(block.output[oi], cursor)
          cursor += outputLineDelay
        }

        // Blank line between blocks
        cursor += blockDelay
        ;((delay: number) => {
          schedule(() => appendBlank(), delay)
        })(cursor)
        cursor += 40
      }

      // All done
      schedule(() => {
        if (!cancelled) setIsComplete(true)
      }, cursor)
    }

    runAll()

    return () => {
      cancelled = true
      timeouts.forEach(clearTimeout)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])  // Run once on mount only

  return { visibleLines, isComplete, currentBlock }
}
