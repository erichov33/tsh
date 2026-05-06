import type { TimelineEvent } from '../chat/types'
import { ScrollReveal } from '../components/ScrollReveal'
import { formatMonthYear } from '../chat/analytics'

type Props = {
  events: TimelineEvent[]
}

function moodLabel(mood: TimelineEvent['mood']) {
  if (mood === 'funny') return 'laugh'
  if (mood === 'hard') return 'hard day'
  if (mood === 'milestone') return 'milestone'
  return 'soft'
}

export function TimelineSection({ events }: Props) {
  return (
    <section className="section timeline" id="timeline" aria-label="Timeline">
      <div className="container">
        <ScrollReveal as="header" className="section-header">
          <h2 className="section-title">The timeline</h2>
          <p className="section-lede">Not everything that mattered was loud. But it all counted.</p>
        </ScrollReveal>

        <div className="timeline-rail" aria-hidden="true" />

        <div className="timeline-list">
          {events.map((e, idx) => (
            <ScrollReveal
              key={`${e.date}-${e.title}-${idx}`}
              as="article"
              className={['paper-card', 'timeline-card', idx % 2 ? 'right' : 'left'].join(' ')}
              delayMs={idx * 60}
            >
              <div className="timeline-meta">
                <div className="timeline-date">{formatMonthYear(e.date)}</div>
                <div className={['pill', e.mood ? `mood-${e.mood}` : ''].join(' ')}>
                  {moodLabel(e.mood)}
                </div>
              </div>
              <h3 className="timeline-title">{e.title}</h3>
              <p className="timeline-caption">{e.caption}</p>
              {e.snippet ? <div className="timeline-snippet">“{e.snippet}”</div> : null}
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  )
}

