import { useMemo } from 'react'
import type { ISODate } from '../chat/analytics'

type Props = {
  countsByDay: Map<ISODate, number>
  startISO: ISODate
  endISO: ISODate
}

type Cell = {
  date: ISODate
  count: number
  level: 0 | 1 | 2 | 3 | 4
  weekday: number
  label: string
}

function formatCellLabel(dateISO: ISODate, count: number) {
  const d = new Date(`${dateISO}T00:00:00`)
  const dateText = d.toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  const countText = count === 1 ? '1 message' : `${count} messages`
  return `${dateText}: ${countText}`
}

function computeLevel(count: number, max: number): 0 | 1 | 2 | 3 | 4 {
  if (count <= 0 || max <= 0) return 0
  const ratio = count / max
  if (ratio <= 0.15) return 1
  if (ratio <= 0.35) return 2
  if (ratio <= 0.6) return 3
  return 4
}

export function Heatmap({ countsByDay, startISO, endISO }: Props) {
  const { cells, weekCount, monthLabels } = useMemo(() => {
    const start = new Date(`${startISO}T00:00:00`)
    const end = new Date(`${endISO}T00:00:00`)
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return { cells: [] as Cell[], weekCount: 0, monthLabels: [] as { weekIndex: number; label: string }[] }
    }

    const dayCount = Math.max(1, Math.round((end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)) + 1)

    let max = 0
    for (const v of countsByDay.values()) max = Math.max(max, v)

    const result: Cell[] = []
    const cursor = new Date(start)
    for (let i = 0; i < dayCount; i += 1) {
      const dateISO = `${cursor.getFullYear()}-${`${cursor.getMonth() + 1}`.padStart(2, '0')}-${`${cursor.getDate()}`.padStart(2, '0')}` as ISODate
      const count = countsByDay.get(dateISO) ?? 0
      const weekday = cursor.getDay()
      result.push({
        date: dateISO,
        count,
        weekday,
        level: computeLevel(count, max),
        label: formatCellLabel(dateISO, count),
      })
      cursor.setDate(cursor.getDate() + 1)
    }

    const firstWeekday = result[0]?.weekday ?? 0
    const padStartCells: Cell[] = []
    for (let i = 0; i < firstWeekday; i += 1) {
      const fakeDate = `0000-00-00` as ISODate
      padStartCells.push({ date: fakeDate, count: 0, weekday: i, level: 0, label: '' })
    }

    const all = [...padStartCells, ...result]
    const weekCount = Math.ceil(all.length / 7)

    const monthLabels: { weekIndex: number; label: string }[] = []
    let lastMonth = -1
    for (let w = 0; w < weekCount; w += 1) {
      const weekCells = all.slice(w * 7, w * 7 + 7)
      const firstReal = weekCells.find((c) => c.date !== ('0000-00-00' as ISODate))
      if (!firstReal) continue
      const d = new Date(`${firstReal.date}T00:00:00`)
      if (Number.isNaN(d.getTime())) continue
      const month = d.getMonth()
      if (month !== lastMonth) {
        monthLabels.push({ weekIndex: w, label: d.toLocaleString(undefined, { month: 'short' }) })
        lastMonth = month
      }
    }

    return { cells: all, weekCount, monthLabels }
  }, [countsByDay, endISO, startISO])

  const width = weekCount

  return (
    <div className="heatmap-wrap" style={{ ['--weeks' as never]: width }}>
      <div className="heatmap-months" aria-hidden="true">
        {monthLabels.map((m) => (
          <div key={`${m.weekIndex}-${m.label}`} className="month" style={{ gridColumn: m.weekIndex + 1 }}>
            {m.label}
          </div>
        ))}
      </div>
      <div className="heatmap">
        {cells.map((c, idx) => {
          const isPad = c.date === ('0000-00-00' as ISODate)
          return (
            <div
              key={`${c.date}-${idx}`}
              className={['cell', `lvl-${c.level}`, isPad ? 'pad' : ''].join(' ')}
              role={isPad ? 'presentation' : 'img'}
              aria-label={isPad ? undefined : c.label}
              title={isPad ? undefined : c.label}
            />
          )
        })}
      </div>
    </div>
  )
}
