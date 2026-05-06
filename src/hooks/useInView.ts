import { useEffect, useMemo, useRef, useState } from 'react'
import { useReducedMotion } from './useReducedMotion'

export type InViewOptions = {
  rootMargin?: string
  threshold?: number | number[]
  once?: boolean
}

export function useInView<T extends HTMLElement>(options: InViewOptions = {}) {
  const { rootMargin = '0px 0px -15% 0px', threshold = 0.15, once = true } = options
  const prefersReducedMotion = useReducedMotion()

  const ref = useRef<T | null>(null)
  const [inView, setInView] = useState(false)

  const stableThreshold = useMemo(() => threshold, [threshold])

  useEffect(() => {
    if (prefersReducedMotion) {
      const t = window.setTimeout(() => setInView(true), 0)
      return () => window.clearTimeout(t)
    }

    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry) return
        if (entry.isIntersecting) {
          setInView(true)
          if (once) observer.disconnect()
        } else if (!once) {
          setInView(false)
        }
      },
      { rootMargin, threshold: stableThreshold },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [once, prefersReducedMotion, rootMargin, stableThreshold])

  return { ref, inView }
}
