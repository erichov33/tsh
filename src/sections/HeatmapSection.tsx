import type { ISODate } from '../chat/analytics'
import { formatMonthYear } from '../chat/analytics'
import { ScrollReveal } from '../components/ScrollReveal'
import { Heatmap } from '../components/Heatmap'

type Props = {
  countsByDay: Map<ISODate, number>
  days?: number
}

export function HeatmapSection({ countsByDay, days = 210 }: Props) {
  const range = (() => {
    const keys = [...countsByDay.keys()].sort()
    const first = keys[0]
    const last = keys[keys.length - 1]
    if (!first || !last) return null
    return `${formatMonthYear(first)} → ${formatMonthYear(last)}`
  })()

  return (
    <section className="section heat" id="heatmap" aria-label="Chat heatmap">
      <div className="container">
        <ScrollReveal as="header" className="section-header">
          <h2 className="section-title">The days we showed up</h2>
          <p className="section-lede">Even on quiet days, we still found each other.</p>
          {range ? <p className="section-sub">{range}</p> : null}
        </ScrollReveal>

        <ScrollReveal as="div" className="paper-card heat-card">
          <Heatmap countsByDay={countsByDay} days={days} />
          <div className="heat-legend" aria-hidden="true">
            <span>less</span>
            <span className="dot lvl-1" />
            <span className="dot lvl-2" />
            <span className="dot lvl-3" />
            <span className="dot lvl-4" />
            <span>more</span>
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
