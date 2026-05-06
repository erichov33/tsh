import type { ISODate } from '../chat/analytics'
import type { ChatParticipant, ParticipantId } from '../chat/types'
import { ScrollReveal } from '../components/ScrollReveal'

type Quote = { id: string; text: string; by: ParticipantId; date: ISODate }

type Props = {
  quotes: Quote[]
  participants: ChatParticipant[]
}

function nameFor(participants: ChatParticipant[], id: ParticipantId) {
  return participants.find((p) => p.id === id)?.name ?? 'Someone'
}

function formatQuoteDate(dateISO: ISODate) {
  const d = new Date(`${dateISO}T00:00:00`)
  if (Number.isNaN(d.getTime())) return dateISO
  return d.toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export function QuotesSection({ quotes, participants }: Props) {
  return (
    <section className="section quotes" id="quotes" aria-label="Quotes">
      <div className="container">
        <ScrollReveal as="header" className="section-header">
          <h2 className="section-title">Things we said that I kept</h2>
          <p className="section-lede">Not because they were perfect. Because they were true.</p>
        </ScrollReveal>

        <div className="quotes-grid">
          {quotes.map((q, idx) => {
            const rotation = ((idx % 5) - 2) * 1.2
            const who = nameFor(participants, q.by)
            return (
              <ScrollReveal
                key={q.id}
                as="figure"
                className={['polaroid', idx % 2 ? 'note' : 'photo'].join(' ')}
                delayMs={idx * 70}
              >
                <div className="polaroid-inner" style={{ ['--rot' as never]: `${rotation}deg` }}>
                  <div className="polaroid-tape" aria-hidden="true" />
                  <blockquote className="quote-text">“{q.text}”</blockquote>
                  <figcaption className="quote-meta">
                    <span className="quote-by handwritten">{who}</span>
                    <span className="dot" aria-hidden="true">
                      ·
                    </span>
                    <span className="quote-date">{formatQuoteDate(q.date)}</span>
                  </figcaption>
                </div>
              </ScrollReveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
