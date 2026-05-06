import type { ChatData } from '../chat/types'
import { ScrollReveal } from '../components/ScrollReveal'

type Props = {
  data: ChatData
}

export function PeakSection({ data }: Props) {
  const meta = data.meta ?? {}
  const headline = meta.peakHeadline ?? 'The part that feels like a movie'
  const body =
    meta.peakBody ??
    'Not because it was dramatic. Because it was steady. Because love started to look like a habit: tiny check-ins, brave honesty, the kind of care that doesn’t need an audience.'

  return (
    <section className="section peak" id="peak" aria-label="Emotional peak">
      <div className="peak-bg" aria-hidden="true" />
      <div className="container">
        <ScrollReveal as="div" className="peak-block">
          <div className="peak-kicker handwritten">the emotional peak</div>
          <h2 className="peak-title">{headline}</h2>
          <p className="peak-body">{body}</p>
          <div className="peak-glow" aria-hidden="true" />
        </ScrollReveal>
      </div>
    </section>
  )
}

