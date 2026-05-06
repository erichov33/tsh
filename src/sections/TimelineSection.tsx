import type { ReactElement } from 'react'
import type { TimelineEvent } from '../chat/types'
import { ScrollReveal } from '../components/ScrollReveal'

type Props = {
  events: TimelineEvent[]
}

function formatDateISO(dateISO: string) {
  const d = new Date(`${dateISO}T00:00:00`)
  if (Number.isNaN(d.getTime())) return dateISO
  return d.toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function moodLabel(mood: TimelineEvent['mood']) {
  if (mood === 'funny') return 'laugh'
  if (mood === 'hard') return 'hard day'
  if (mood === 'milestone') return 'milestone'
  return 'soft'
}

export function TimelineSection({ events }: Props) {
  const items = events.reduce<{ nodes: ReactElement[]; lastMonth: string }>(
    (acc, e, idx) => {
      const monthKey = e.date.slice(0, 7)
      const monthChanged = monthKey !== acc.lastMonth

      if (monthChanged) {
        acc.nodes.push(
          <li key={`month-${monthKey}`} className="timeline-month">
            <span className="timeline-month-text">{formatDateISO(`${monthKey}-01`).replace(/\s\d{1,2},/, '')}</span>
          </li>,
        )
        acc.lastMonth = monthKey
      }

      acc.nodes.push(
        <li key={`${e.date}-${e.title}-${idx}`} className="timeline-item">
          <div className="timeline-marker" aria-hidden="true" />
          <ScrollReveal as="article" className={['paper-card', 'timeline-card'].join(' ')} delayMs={idx * 60}>
            <div className="timeline-meta">
              <div className="timeline-date">{formatDateISO(e.date)}</div>
              <div className={['pill', e.mood ? `mood-${e.mood}` : ''].join(' ')}>
                {moodLabel(e.mood)}
              </div>
            </div>
            <h3 className="timeline-title">{e.title}</h3>
            <p className="timeline-caption">{e.caption}</p>
            {e.snippet ? <div className="timeline-snippet">“{e.snippet}”</div> : null}
          </ScrollReveal>
        </li>,
      )

      return acc
    },
    { nodes: [], lastMonth: '' },
  ).nodes

  return (
    <section className="section timeline" id="timeline" aria-label="Timeline">
      <div className="container">
        <ScrollReveal as="header" className="section-header">
          <h2 className="section-title">The timeline</h2>
          <p className="section-lede">Not everything that mattered was loud. But it all counted.</p>
        </ScrollReveal>

        <ol className="timeline-list" aria-label="Milestones">
          {items}
        </ol>
      </div>
    </section>
  )
}
