import type { EmojiCount } from '../chat/analytics'
import type { ChatParticipant, ParticipantId } from '../chat/types'
import { ScrollReveal } from '../components/ScrollReveal'

type Props = {
  participants: ChatParticipant[]
  topByPerson: Map<ParticipantId, EmojiCount[]>
}

function playfulCaption(emoji: string, personId: ParticipantId) {
  const isMe = personId === 'tadi'
  if (emoji.includes('😂') || emoji.includes('🤣')) {
    return isMe
      ? 'If laughter is a love language… you’ve been fluent.'
      : 'You laugh at me like you’re trying not to fall. It never works.'
  }
  if (emoji.includes('😭')) return 'Our emotional support emoji. No shame.'
  if (emoji.includes('🥹')) return 'Soft tears. The best kind.'
  if (emoji.includes('🫶')) return 'Hands that say what words can’t.'
  if (emoji.includes('❤️') || emoji.includes('💗') || emoji.includes('💕')) {
    return isMe ? 'I left hearts like breadcrumbs back to you.' : 'You made “❤️” feel like a full sentence.'
  }
  return 'A tiny signature you kept leaving everywhere.'
}

export function EmojiStatsSection({ participants, topByPerson }: Props) {
  return (
    <section className="section emojis" id="emojis" aria-label="Emoji stats">
      <div className="container">
        <ScrollReveal as="header" className="section-header">
          <h2 className="section-title">Our emoji fingerprints</h2>
          <p className="section-lede">Even when we were tired, we still decorated the day.</p>
        </ScrollReveal>

        <div className="emoji-grid">
          {participants.map((p, idx) => {
            const items = topByPerson.get(p.id) ?? []
            const top = items[0]?.emoji
            return (
              <ScrollReveal key={p.id} as="section" className="emoji-card paper-card" delayMs={idx * 80}>
                <div className="emoji-person">
                  <div className="emoji-name handwritten">{p.name}</div>
                  <div className="emoji-sub">Most-used little feelings</div>
                </div>
                <div className="emoji-row" aria-label={`Top emojis for ${p.name}`}>
                  {items.map((e) => (
                    <div key={`${p.id}-${e.emoji}`} className="sticker" style={{ ['--sticker-accent' as never]: p.accent ?? '#b65a6b' }}>
                      <div className="sticker-emoji" aria-hidden="true">
                        {e.emoji}
                      </div>
                      <div className="sticker-count">{e.count}</div>
                    </div>
                  ))}
                </div>
                {top ? <div className="emoji-caption">“{playfulCaption(top, p.id)}”</div> : null}
              </ScrollReveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
