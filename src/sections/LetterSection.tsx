import type { ChatData } from '../chat/types'
import { ScrollReveal } from '../components/ScrollReveal'

type Props = {
  data: ChatData
}

function splitParagraphs(text: string): string[] {
  return text
    .split(/\n{2,}/g)
    .map((p) => p.trim())
    .filter(Boolean)
}

export function LetterSection({ data }: Props) {
  const meta = data.meta ?? {}
  const title = meta.letterTitle ?? 'A love letter'
  const body =
    meta.letterBody ??
    'I don’t know how to say this in a way that’s smaller than it feels.\n\nI love you — the real you. The you on good days. The you on exhausted days. The you who tries anyway.\n\nThank you for letting me be close.'
  const finalLine = meta.finalLine ?? 'You are my favorite place to return to.'

  return (
    <section className="section letter" id="letter" aria-label="Final love letter">
      <div className="letter-bg" aria-hidden="true" />
      <div className="container">
        <ScrollReveal as="div" className="letter-card">
          <div className="letter-kicker handwritten">for you</div>
          <h2 className="letter-title">{title}</h2>
          <div className="letter-body">
            {splitParagraphs(body).map((p, idx) => (
              <p key={idx}>{p}</p>
            ))}
          </div>
          <div className="letter-final handwritten">{finalLine}</div>
        </ScrollReveal>
      </div>
    </section>
  )
}

