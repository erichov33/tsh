import './App.css'
import { useEffect, useMemo, useState } from 'react'
import { loadChatData } from './chat/loadChat'
import { autoPickQuotes, buildDailyCounts, computeTopEmojisByPerson, computeWrappedSummary, deriveTimelineEvents, findFirstAffectionMoments, findFirstLoveYou } from './chat/analytics'
import type { ChatData } from './chat/types'
import { IntroSection } from './sections/IntroSection'
import { TimelineSection } from './sections/TimelineSection'
import { EmojiStatsSection } from './sections/EmojiStatsSection'
import { LoveFirstSection } from './sections/LoveFirstSection'
import { QuotesSection } from './sections/QuotesSection'
import { HeatmapSection } from './sections/HeatmapSection'
import { PeakSection } from './sections/PeakSection'
import { LetterSection } from './sections/LetterSection'

function App() {
  const [data, setData] = useState<ChatData | null>(null)

  useEffect(() => {
    let mounted = true
    loadChatData().then((d) => {
      if (mounted) setData(d)
    })
    return () => {
      mounted = false
    }
  }, [])

  const derived = useMemo(() => {
    if (!data) return null
    const participants = data.participants
    const messages = data.messages
    const summary = computeWrappedSummary(messages)
    const events = deriveTimelineEvents(data)
    const emojis = computeTopEmojisByPerson(messages, 5)
    const loveMoment = findFirstLoveYou(messages)
    const affection = findFirstAffectionMoments(messages)
    const quotes = autoPickQuotes(data, 6)
    const dailyCounts = buildDailyCounts(messages)
    return { participants, summary, events, emojis, loveMoment, affection, quotes, dailyCounts }
  }, [data])

  const onStart = () => {
    document.getElementById('timeline')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  if (!data || !derived) {
    return (
      <main className="app">
        <section className="section intro">
          <div className="intro-bg" aria-hidden="true" />
          <div className="container">
            <div className="intro-card paper-card">
              <div className="intro-kicker handwritten">loading…</div>
              <h1 className="intro-headline">Rewinding us</h1>
              <p className="intro-subtext">Gathering little moments.</p>
            </div>
          </div>
        </section>
      </main>
    )
  }

  const meta = data.meta ?? {}
  const fromName = meta.fromName ?? derived.participants[0]?.name ?? 'Me'
  const partnerName = meta.partnerName ?? derived.participants[1]?.name ?? 'You'

  return (
    <main className="app" aria-label="Relationship wrapped landing page">
      <div className="grain" aria-hidden="true" />
      <div className="page-fade" aria-hidden="true" />

      <header className="topline" aria-label="Header">
        <div className="topline-inner">
          <div className="brand handwritten">{meta.title ?? 'relationship wrapped'}</div>
          <div className="tiny">
            from <span className="handwritten">{fromName}</span> to <span className="handwritten">{partnerName}</span>
          </div>
        </div>
      </header>

      <IntroSection data={data} onStart={onStart} />
      <TimelineSection events={derived.events} />
      <EmojiStatsSection participants={derived.participants} topByPerson={derived.emojis} />
      <LoveFirstSection participants={derived.participants} loveMoment={derived.loveMoment} affection={derived.affection} />
      <QuotesSection quotes={derived.quotes} participants={derived.participants} />
      <HeatmapSection countsByDay={derived.dailyCounts} />
      <PeakSection data={data} />
      <LetterSection data={data} />

      <footer className="footer">
        <div className="container footer-inner">
          <div className="footer-line handwritten">{meta.finalLine ?? 'Still here.'}</div>
          <div className="footer-meta">
            {derived.summary.uniqueDays} days · {derived.summary.totalMessages} messages · longest streak{' '}
            {derived.summary.longestStreakDays} days
          </div>
        </div>
      </footer>
    </main>
  )
}

export default App
