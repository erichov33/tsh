import type { ElementType, PropsWithChildren } from 'react'
import { useInView } from '../hooks/useInView'

type Props<TTag extends ElementType> = PropsWithChildren<{
  as?: TTag
  className?: string
  delayMs?: number
}>

export function ScrollReveal<TTag extends ElementType = 'div'>({
  as,
  className,
  delayMs = 0,
  children,
}: Props<TTag>) {
  const Tag = (as ?? 'div') as ElementType
  const { ref, inView } = useInView<HTMLElement>()

  return (
    <Tag
      ref={ref}
      className={['reveal', inView ? 'is-in' : '', className ?? ''].filter(Boolean).join(' ')}
      style={{ ['--reveal-delay' as never]: `${delayMs}ms` }}
    >
      {children}
    </Tag>
  )
}

