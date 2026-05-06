import { useEffect, useMemo, useState } from 'react'
import { useReducedMotion } from '../hooks/useReducedMotion'

type Props = {
  text: string
  start?: boolean
  speedMs?: number
  className?: string
}

export function TypewriterReveal({ text, start = true, speedMs = 28, className }: Props) {
  const prefersReducedMotion = useReducedMotion()
  const normalized = useMemo(() => text, [text])
  const [visibleCount, setVisibleCount] = useState(0)

  useEffect(() => {
    if (!start) return
    if (prefersReducedMotion) return

    const reset = window.setTimeout(() => setVisibleCount(0), 0)
    const interval = window.setInterval(() => {
      setVisibleCount((c) => {
        const next = Math.min(normalized.length, c + 1)
        if (next >= normalized.length) window.clearInterval(interval)
        return next
      })
    }, speedMs)

    return () => {
      window.clearTimeout(reset)
      window.clearInterval(interval)
    }
  }, [normalized, prefersReducedMotion, speedMs, start])

  const shown = prefersReducedMotion ? normalized.length : visibleCount
  const done = shown >= normalized.length

  return (
    <span className={['typewriter', className ?? ''].filter(Boolean).join(' ')}>
      <span aria-hidden="true">{normalized.slice(0, shown)}</span>
      <span className="sr-only">{normalized}</span>
      <span className={['caret', done ? 'done' : ''].join(' ')} aria-hidden="true" />
    </span>
  )
}
