import type { ISODate } from '../chat/analytics'
import { formatMonthYear } from '../chat/analytics'
import { ScrollReveal } from '../components/ScrollReveal'
import { Heatmap } from '../components/Heatmap'

type Props = {
  countsByDay: Map<ISODate, number>
}

export function HeatmapSection({ countsByDay }: Props) {
  const today = new Date()
  const endISO = `${today.getFullYear()}-${`${today.getMonth() + 1}`.padStart(2, '0')}-${`${today.getDate()}`.padStart(2, '0')}` as ISODate
  const startISO = '2026-02-01' as ISODate
  const range = `${formatMonthYear(startISO)} → ${formatMonthYear(endISO)}`

  return (
    <section className="section heat" id="heatmap" aria-label="Chat heatmap">
      <div className="container">
        <ScrollReveal as="header" className="section-header">
          <h2 className="section-title">The days we showed up</h2>
          <p className="section-lede">Even on quiet days, we still found each other.</p>
          {range ? <p className="section-sub">{range}</p> : null}
        </ScrollReveal>

        <ScrollReveal as="div" className="paper-card heat-card">
          <Heatmap countsByDay={countsByDay} startISO={startISO} endISO={endISO} />
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
