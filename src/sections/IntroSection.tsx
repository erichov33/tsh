import type { ChatData } from '../chat/types'
import { ScrollReveal } from '../components/ScrollReveal'

type Props = {
  data: ChatData
  onStart: () => void
}

export function IntroSection({ data, onStart }: Props) {
  const meta = data.meta ?? {}
  const headline = meta.heroHeadline ?? 'If we could rewind us…'
  const subtext = meta.heroSubtext ?? 'I turned our conversations into something you can feel.'
  const title = meta.relationshipLabel ?? 'a small digital scrapbook'

  return (
    <section className="section intro" aria-label="Intro">
      <div className="intro-bg" aria-hidden="true" />
      <div className="container">
        <ScrollReveal as="div" className="intro-card paper-card">
          <div className="intro-kicker handwritten">{title}</div>
          <h1 className="intro-headline">{headline}</h1>
          <p className="intro-subtext">{subtext}</p>
          <div className="intro-actions">
            <button type="button" className="btn primary" onClick={onStart}>
              Start
            </button>
            <div className="intro-hint">Scroll slowly. It’s meant to be felt.</div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
