import type { ChatData, ChatMessage, ChatParticipant, ParticipantId, TimelineEvent } from './types'

export type ISODate = `${number}-${number}-${number}`

export type EmojiCount = { emoji: string; count: number }

export type LoveYouMoment = {
  senderId: ParticipantId
  timestamp: string
  messageId: string
  matchedText: string
}

export type WrappedSummary = {
  totalMessages: number
  uniqueDays: number
  longestStreakDays: number
  mostActiveDay?: { date: ISODate; count: number }
}

const extendedEmojiRegex = /\p{Extended_Pictographic}/u

function toISODateString(date: Date): ISODate {
  const yyyy = date.getFullYear()
  const mm = `${date.getMonth() + 1}`.padStart(2, '0')
  const dd = `${date.getDate()}`.padStart(2, '0')
  return `${yyyy}-${mm}-${dd}` as ISODate
}

export function safeDateFromTimestamp(timestamp: string): Date | null {
  const d = new Date(timestamp)
  if (Number.isNaN(d.getTime())) return null
  return d
}

export function dayKeyFromTimestamp(timestamp: string): ISODate | null {
  const d = safeDateFromTimestamp(timestamp)
  return d ? toISODateString(d) : null
}

export function formatMonthDay(timestamp: string): string {
  const d = safeDateFromTimestamp(timestamp)
  if (!d) return timestamp
  return d.toLocaleString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })
}

export function formatTime(timestamp: string): string {
  const d = safeDateFromTimestamp(timestamp)
  if (!d) return timestamp
  return d.toLocaleString(undefined, { hour: 'numeric', minute: '2-digit' })
}

export function formatMonthYear(dateISO: string): string {
  const d = new Date(`${dateISO}T00:00:00`)
  if (Number.isNaN(d.getTime())) return dateISO
  return d.toLocaleString(undefined, { month: 'long', year: 'numeric' })
}

export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n))
}

export function normalizeWhitespace(input: string): string {
  return input.replace(/\s+/g, ' ').trim()
}

export function truncateText(text: string, maxChars: number): string {
  const t = normalizeWhitespace(text)
  if (t.length <= maxChars) return t
  return `${t.slice(0, Math.max(0, maxChars - 1)).trimEnd()}…`
}

export function getParticipantById(participants: ChatParticipant[], id: ParticipantId): ChatParticipant | undefined {
  return participants.find((p) => p.id === id)
}

export function sortMessagesAscending(messages: ChatMessage[]): ChatMessage[] {
  return [...messages].sort((a, b) => {
    const da = safeDateFromTimestamp(a.timestamp)?.getTime() ?? 0
    const db = safeDateFromTimestamp(b.timestamp)?.getTime() ?? 0
    return da - db
  })
}

export function buildDailyCounts(messages: ChatMessage[]): Map<ISODate, number> {
  const counts = new Map<ISODate, number>()
  for (const m of messages) {
    const day = dayKeyFromTimestamp(m.timestamp)
    if (!day) continue
    counts.set(day, (counts.get(day) ?? 0) + 1)
  }
  return counts
}

export function computeWrappedSummary(messages: ChatMessage[]): WrappedSummary {
  const sorted = sortMessagesAscending(messages)
  const counts = buildDailyCounts(sorted)
  const days = [...counts.keys()].sort()

  let mostActive: WrappedSummary['mostActiveDay']
  for (const day of days) {
    const c = counts.get(day) ?? 0
    if (!mostActive || c > mostActive.count) mostActive = { date: day, count: c }
  }

  let longestStreak = 0
  let currentStreak = 0
  let prev: Date | null = null
  for (const day of days) {
    const current = new Date(`${day}T00:00:00`)
    if (!prev) {
      currentStreak = 1
    } else {
      const deltaDays = Math.round((current.getTime() - prev.getTime()) / (24 * 60 * 60 * 1000))
      currentStreak = deltaDays === 1 ? currentStreak + 1 : 1
    }
    prev = current
    longestStreak = Math.max(longestStreak, currentStreak)
  }

  return {
    totalMessages: messages.length,
    uniqueDays: counts.size,
    longestStreakDays: longestStreak,
    mostActiveDay: mostActive,
  }
}

function splitEmojiClusters(text: string): string[] {
  const result: string[] = []
  let i = 0

  const isSkinToneModifier = (cp: number) => cp >= 0x1f3fb && cp <= 0x1f3ff
  const isRegionalIndicator = (cp: number) => cp >= 0x1f1e6 && cp <= 0x1f1ff

  while (i < text.length) {
    const codePoint = text.codePointAt(i)
    if (codePoint === undefined) break
    const char = String.fromCodePoint(codePoint)

    if (!extendedEmojiRegex.test(char)) {
      i += char.length
      continue
    }

    let cluster = char
    let j = i + char.length

    if (isRegionalIndicator(codePoint)) {
      const nextCp = text.codePointAt(j)
      if (nextCp !== undefined && isRegionalIndicator(nextCp)) {
        const nextChar = String.fromCodePoint(nextCp)
        cluster += nextChar
        j += nextChar.length
      }
      result.push(cluster)
      i = j
      continue
    }

    while (j < text.length) {
      const nextCp = text.codePointAt(j)
      if (nextCp === undefined) break
      const nextChar = String.fromCodePoint(nextCp)

      if (nextChar === '\uFE0F') {
        cluster += nextChar
        j += nextChar.length
        continue
      }

      if (isSkinToneModifier(nextCp)) {
        cluster += nextChar
        j += nextChar.length
        continue
      }

      if (nextChar === '\u200D') {
        const afterCp = text.codePointAt(j + nextChar.length)
        if (afterCp === undefined) break
        const afterChar = String.fromCodePoint(afterCp)
        if (!extendedEmojiRegex.test(afterChar)) break
        cluster += nextChar + afterChar
        j += nextChar.length + afterChar.length
        continue
      }

      break
    }

    result.push(cluster)
    i = j
  }

  return result
}

export function computeTopEmojisByPerson(
  messages: ChatMessage[],
  topN: number,
): Map<ParticipantId, EmojiCount[]> {
  const perPersonCounts = new Map<ParticipantId, Map<string, number>>()

  for (const m of messages) {
    if (!m.text) continue
    const emojis = splitEmojiClusters(m.text)
    if (emojis.length === 0) continue
    const bucket = perPersonCounts.get(m.senderId) ?? new Map<string, number>()
    for (const e of emojis) bucket.set(e, (bucket.get(e) ?? 0) + 1)
    perPersonCounts.set(m.senderId, bucket)
  }

  const result = new Map<ParticipantId, EmojiCount[]>()
  for (const [person, counts] of perPersonCounts.entries()) {
    const sorted = [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, topN)
      .map(([emoji, count]) => ({ emoji, count }))
    result.set(person, sorted)
  }

  return result
}

export function findFirstLoveYou(messages: ChatMessage[]): LoveYouMoment | null {
  const sorted = sortMessagesAscending(messages)
  const patterns: RegExp[] = [
    /\bi\s+love\s+you\b/i,
    /\blove\s+you\b/i,
    /\bily\b/i,
  ]

  for (const m of sorted) {
    const text = normalizeWhitespace(m.text)
    if (!text) continue
    for (const re of patterns) {
      const match = text.match(re)
      if (!match) continue
      return {
        senderId: m.senderId,
        timestamp: m.timestamp,
        messageId: m.id,
        matchedText: match[0],
      }
    }
  }
  return null
}

export type PhraseMoment = LoveYouMoment & { phrase: string; messageText: string }

function findFirstPhrase(
  messages: ChatMessage[],
  phrase: string,
  regex: RegExp,
  shouldSkip?: (messageText: string) => boolean,
): PhraseMoment | null {
  const sorted = sortMessagesAscending(messages)
  for (const m of sorted) {
    const messageText = normalizeWhitespace(m.text)
    if (!messageText) continue
    if (shouldSkip?.(messageText)) continue
    const match = messageText.match(regex)
    if (!match) continue
    return {
      phrase,
      senderId: m.senderId,
      timestamp: m.timestamp,
      messageId: m.id,
      matchedText: match[0],
      messageText,
    }
  }
  return null
}

export function findFirstAffectionMoments(messages: ChatMessage[]): PhraseMoment[] {
  const moments: PhraseMoment[] = []

  const loveYou = findFirstPhrase(messages, 'i love you', /\bi\s+love\s+you\b/i)
  if (loveYou) moments.push(loveYou)

  const babe = findFirstPhrase(messages, 'babe', /\bbabe\b/i)
  if (babe) moments.push(babe)

  const baby = findFirstPhrase(messages, 'baby', /\bbaby\b/i)
  if (baby) moments.push(baby)

  const love = findFirstPhrase(
    messages,
    'love',
    /\blove\b/i,
    (t) => /\bi\s+love\s+you\b/i.test(t) || /\blove\s+you\b/i.test(t),
  )
  if (love) moments.push(love)

  return moments
}

export function deriveTimelineEvents(data: ChatData, limit = 8): TimelineEvent[] {
  const explicit = (data.events ?? []).map((e) => ({ ...e }))
  const sortedMessages = sortMessagesAscending(data.messages)
  if (sortedMessages.length === 0) return explicit.slice(0, limit)

  const inferred: TimelineEvent[] = []

  const first = sortedMessages[0]
  const firstDate = dayKeyFromTimestamp(first.timestamp)
  if (firstDate) {
    inferred.push({
      date: firstDate,
      title: 'The first page',
      caption: 'One small message that quietly changed the shape of my days.',
      snippet: truncateText(first.text, 120),
      mood: 'milestone',
    })
  }

  const keywordFind = (keywords: string[]): ChatMessage | undefined => {
    const lowerKeywords = keywords.map((k) => k.toLowerCase())
    return sortedMessages.find((m) => lowerKeywords.some((k) => m.text.toLowerCase().includes(k)))
  }

  const firstCall = keywordFind(['call', 'phone', 'facetime', 'video call'])
  if (firstCall) {
    const d = dayKeyFromTimestamp(firstCall.timestamp)
    if (d) {
      inferred.push({
        date: d,
        title: 'When voices became real',
        caption: 'Text was good. Hearing you felt like breathing easier.',
        snippet: truncateText(firstCall.text, 120),
        mood: 'sweet',
      })
    }
  }

  const firstPlan = keywordFind(['flight', 'ticket', 'airport', 'visit', 'see you', 'booked'])
  if (firstPlan) {
    const d = dayKeyFromTimestamp(firstPlan.timestamp)
    if (d) {
      inferred.push({
        date: d,
        title: 'We started making plans',
        caption: 'Not just talking about “someday” — actually reaching for it.',
        snippet: truncateText(firstPlan.text, 120),
        mood: 'milestone',
      })
    }
  }

  const funniest = sortedMessages
    .filter((m) => m.text.includes('😂') || m.text.includes('🤣') || m.text.toLowerCase().includes('lmao'))
    .slice(0, 1)[0]
  if (funniest) {
    const d = dayKeyFromTimestamp(funniest.timestamp)
    if (d) {
      inferred.push({
        date: d,
        title: 'The laugh that stuck',
        caption: 'The kind of laugh that makes you look around like, “oh — it’s you.”',
        snippet: truncateText(funniest.text, 120),
        mood: 'funny',
      })
    }
  }

  const tender = sortedMessages
    .filter((m) => /miss you|proud of you|safe|home|thank you|i appreciate/i.test(m.text))
    .slice(0, 1)[0]
  if (tender) {
    const d = dayKeyFromTimestamp(tender.timestamp)
    if (d) {
      inferred.push({
        date: d,
        title: 'Soft things, said out loud',
        caption: 'We kept choosing honesty, even when it was tender.',
        snippet: truncateText(tender.text, 120),
        mood: 'sweet',
      })
    }
  }

  const hard = sortedMessages
    .filter((m) => /hard|cry|tired|anxious|sorry|overwhelm|hurt/i.test(m.text))
    .slice(0, 1)[0]
  if (hard) {
    const d = dayKeyFromTimestamp(hard.timestamp)
    if (d) {
      inferred.push({
        date: d,
        title: 'Even the hard days',
        caption: 'We didn’t have to be perfect. We just kept showing up.',
        snippet: truncateText(hard.text, 120),
        mood: 'hard',
      })
    }
  }

  const love = findFirstLoveYou(sortedMessages)
  if (love) {
    const d = dayKeyFromTimestamp(love.timestamp)
    if (d) {
      inferred.push({
        date: d,
        title: 'The sentence that made it real',
        caption: 'After that, everything had a little more light in it.',
        snippet: truncateText(
          sortedMessages.find((m) => m.id === love.messageId)?.text ?? love.matchedText,
          120,
        ),
        mood: 'milestone',
      })
    }
  }

  const merged = [...explicit, ...inferred]
    .filter((e) => Boolean(e.date && e.title && e.caption))
    .sort((a, b) => new Date(`${a.date}T00:00:00`).getTime() - new Date(`${b.date}T00:00:00`).getTime())

  const uniqueByKey = new Map<string, TimelineEvent>()
  for (const e of merged) uniqueByKey.set(`${e.date}-${e.title}`, e)

  return [...uniqueByKey.values()].slice(0, limit)
}

export function autoPickQuotes(data: ChatData, desired = 6): { id: string; text: string; by: ParticipantId; date: ISODate }[] {
  const explicit = (data.quotes ?? []).slice(0, desired).flatMap((q) => {
    if (!q.by || !q.date) return []
    return [{ id: q.id, text: q.text, by: q.by, date: q.date as ISODate }]
  })
  if (explicit.length >= Math.min(desired, 4)) return explicit.slice(0, desired)

  const candidates = sortMessagesAscending(data.messages)
    .map((m) => {
      const day = dayKeyFromTimestamp(m.timestamp)
      return { m, day }
    })
    .filter(({ m, day }) => Boolean(day) && m.text && m.text.length >= 35 && m.text.length <= 220)
    .filter(({ m }) => !/http:\/\/|https:\/\//i.test(m.text))
    .filter(({ m }) => splitEmojiClusters(m.text).length <= 4)
    .map(({ m, day }) => {
      const softScore =
        (/(miss you|proud|safe|home|thank you|i appreciate|love)/i.test(m.text) ? 4 : 0) +
        (/[.!?]/.test(m.text) ? 1 : 0) +
        clamp(Math.round(m.text.length / 60), 0, 4)
      return { m, day: day as ISODate, score: softScore }
    })
    .sort((a, b) => b.score - a.score)

  const picked: { id: string; text: string; by: ParticipantId; date: ISODate }[] = []
  const usedDays = new Set<string>()
  for (const c of candidates) {
    if (picked.length >= desired) break
    if (usedDays.has(c.day)) continue
    usedDays.add(c.day)
    picked.push({ id: c.m.id, text: normalizeWhitespace(c.m.text), by: c.m.senderId, date: c.day })
  }

  return [...explicit, ...picked].slice(0, desired)
}
