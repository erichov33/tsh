import { useEffect, useMemo, useState } from 'react'
import type { LoveYouMoment, PhraseMoment } from '../chat/analytics'
import type { ChatParticipant } from '../chat/types'
import { formatMonthDay, formatTime, getParticipantById } from '../chat/analytics'
import { ScrollReveal } from '../components/ScrollReveal'
import { TypewriterReveal } from '../components/TypewriterReveal'
import { useInView } from '../hooks/useInView'

type Props = {
  participants: ChatParticipant[]
  loveMoment: LoveYouMoment | null
  affection: PhraseMoment[]
}

function momentLabel(phrase: string) {
  if (phrase === 'babe') return 'First “babe”'
  if (phrase === 'baby') return 'First “baby”'
  if (phrase === 'love') return 'First “love”'
  return 'First “I love you”'
}

export function LoveFirstSection({ participants, affection }: Props) {
  const { ref, inView } = useInView<HTMLElement>({ rootMargin: '0px 0px -25% 0px', threshold: 0.25 })
  const [start, setStart] = useState(false)

  useEffect(() => {
    if (!inView) return
    const t = window.setTimeout(() => setStart(true), 900)
    return () => window.clearTimeout(t)
  }, [inView])

  const loveYou = useMemo(() => affection.find((m) => m.phrase === 'i love you') ?? null, [affection])

  const revealText = useMemo(() => {
    if (!loveYou) return 'Some moments stay private — but this one is still my favorite.'
    const sender = getParticipantById(participants, loveYou.senderId)?.name ?? 'Someone'
    const when = `${formatMonthDay(loveYou.timestamp)} · ${formatTime(loveYou.timestamp)}`
    return `${sender} said it first. (${when})`
  }, [loveYou, participants])

  const revealQuote = useMemo(() => {
    if (!loveYou) return null
    const sender = getParticipantById(participants, loveYou.senderId)?.name ?? 'Someone'
    return { sender, text: loveYou.messageText }
  }, [loveYou, participants])

  const extras = useMemo(
    () => affection.filter((m) => m.phrase !== 'i love you').slice(0, 3),
    [affection],
  )

  return (
    <section className="section love-first" id="love-first" aria-label="Who said I love you first" ref={ref}>
      <div className="container">
        <ScrollReveal as="header" className="section-header">
          <h2 className="section-title">Who said “I love you” first?</h2>
          <p className="section-lede">A tiny sentence. A whole turning point.</p>
        </ScrollReveal>

        <div className="cinema">
          <div className="cinema-frame" aria-hidden="true" />
          <div className="cinema-content paper-card">
            <div className="cinema-kicker handwritten">dramatic pause…</div>
            <div className="cinema-reveal">
              <TypewriterReveal text={revealText} start={start} />
            </div>
            {revealQuote ? (
              <div className="cinema-quote">
                <div className="cinema-quote-text">“{revealQuote.text}”</div>
                <div className="cinema-quote-by handwritten">{revealQuote.sender}</div>
              </div>
            ) : null}
            <div className="cinema-note">
              {loveYou ? 'I remember where my heart went when I read it.' : 'If your data doesn’t include it, you can still add it. But you don’t have to.'}
            </div>
          </div>
        </div>

        {extras.length ? (
          <div className="affection-grid" aria-label="Other firsts">
            {extras.map((m) => {
              const who = getParticipantById(participants, m.senderId)?.name ?? 'Someone'
              const when = `${formatMonthDay(m.timestamp)} · ${formatTime(m.timestamp)}`
              return (
                <ScrollReveal key={m.phrase} as="article" className="paper-card affection-card">
                  <div className="affection-top">
                    <div className="affection-label">{momentLabel(m.phrase)}</div>
                    <div className="affection-when">{when}</div>
                  </div>
                  <div className="affection-text">“{m.messageText}”</div>
                  <div className="affection-by handwritten">{who}</div>
                </ScrollReveal>
              )
            })}
          </div>
        ) : null}
      </div>
    </section>
  )
}
