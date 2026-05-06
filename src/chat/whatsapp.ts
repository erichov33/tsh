import type { ChatData, ChatMessage, ChatParticipant, ParticipantId } from './types'

type ParseOptions = {
  meName: string
  partnerName: string
}

type ParsedLine = {
  timestamp: string
  senderRaw?: string
  text?: string
  isAttachment?: boolean
}

const linePattern = /^\[(\d{4}\/\d{2}\/\d{2}),\s(\d{2}:\d{2}:\d{2})\]\s(.*)$/u
const extendedEmojiRegex = /\p{Extended_Pictographic}/gu
const bidiPrefixPattern = /^[\u200E\u200F\uFEFF\u202A-\u202E]+/gu
const encryptionBannerPattern =
  /Messages and calls are end-to-end encrypted\. Only people in this chat can read, listen to, or share them/i
const contactSystemPattern = /\bis a contact\.\s*$/i

function toISO(timestampDate: string, timestampTime: string): string {
  const [yyyy, mm, dd] = timestampDate.split('/').map((n) => Number(n))
  const [hh, mi, ss] = timestampTime.split(':').map((n) => Number(n))
  const d = new Date(Date.UTC(yyyy, mm - 1, dd, hh, mi, ss))
  return d.toISOString()
}

function normalizeSenderName(name: string): string {
  return name
    .replace(extendedEmojiRegex, '')
    .replace(/\uFE0F/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function slugifyId(input: string): ParticipantId {
  const cleaned = input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
  return cleaned || 'unknown'
}

function sanitizeText(text: string): string {
  const cleaned = text
    .replace(/\u200E/gu, '')
    .replace(/\u200F/gu, '')
    .replace(/\u202A|\u202B|\u202C|\u202D|\u202E/gu, '')
    .replace(/\b\d{7,}\b/g, '[redacted]')
    .replace(/\+?\d[\d\s()-]{8,}\d/g, '[redacted]')
    .replace(/\bcvv\s*:\s*\d{3,4}\b/gi, 'cvv: [redacted]')
    .replace(/\bcvv\s*\d{3,4}\b/gi, 'cvv [redacted]')
    .trim()

  if (/^\d{2}\/\d{2}$/.test(cleaned)) return '[redacted]'
  if (/^\d{2}\/\d{4}$/.test(cleaned)) return '[redacted]'

  return cleaned
}

function stripInlineAttachments(text: string): string {
  const idx = text.toLowerCase().indexOf('<attached:')
  if (idx === -1) return text
  return text.slice(0, idx).trim()
}

function parseLine(line: string): ParsedLine | null {
  const normalizedLine = line.replace(bidiPrefixPattern, '')
  const match = normalizedLine.match(linePattern)
  if (!match) return null

  const datePart = match[1]
  const timePart = match[2]
  const rest = match[3] ?? ''
  const timestamp = toISO(datePart, timePart)

  const separatorIdx = rest.indexOf(': ')
  if (separatorIdx === -1) {
    const cleaned = sanitizeText(rest)
    if (!cleaned) return null
    if (encryptionBannerPattern.test(cleaned)) return null
    if (contactSystemPattern.test(cleaned)) return null
    if (/^Voice call\b/i.test(cleaned)) return null
    if (/^Missed voice call\b/i.test(cleaned)) return null
    if (/^This message was deleted\.$/i.test(cleaned)) return null
    return { timestamp, text: cleaned }
  }

  const senderRaw = rest.slice(0, separatorIdx)
  const body = rest.slice(separatorIdx + 2)
  const cleanedBody = sanitizeText(body)

  if (!cleanedBody) return { timestamp, senderRaw, text: '', isAttachment: true }
  if (encryptionBannerPattern.test(cleanedBody)) return { timestamp, senderRaw, text: '', isAttachment: true }
  if (contactSystemPattern.test(cleanedBody)) return { timestamp, senderRaw, text: '', isAttachment: true }
  if (/^Voice call\b/i.test(cleanedBody)) return { timestamp, senderRaw, text: '', isAttachment: true }
  if (/^Missed voice call\b/i.test(cleanedBody)) return { timestamp, senderRaw, text: '', isAttachment: true }
  if (/^This message was deleted\.$/i.test(cleanedBody)) return { timestamp, senderRaw, text: '', isAttachment: true }

  const withoutInlineAttachment = stripInlineAttachments(cleanedBody)
  if (!withoutInlineAttachment) return { timestamp, senderRaw, text: '', isAttachment: true }

  const isAttachmentOnly = /^<attached:/i.test(cleanedBody)
  if (isAttachmentOnly) return { timestamp, senderRaw, text: '', isAttachment: true }

  return { timestamp, senderRaw, text: withoutInlineAttachment }
}

export function parseWhatsAppChatExport(raw: string, options: ParseOptions): ChatData {
  const meNormalized = normalizeSenderName(options.meName).toLowerCase()
  const partnerNormalized = normalizeSenderName(options.partnerName).toLowerCase()

  const participantsById = new Map<ParticipantId, ChatParticipant>()
  const nameToId = new Map<string, ParticipantId>()

  const ensureParticipant = (rawName: string): ParticipantId => {
    const normalized = normalizeSenderName(rawName)
    const key = normalized.toLowerCase()
    const existing = nameToId.get(key)
    if (existing) return existing

    const id =
      key === meNormalized ? ('tadi' as ParticipantId) : key === partnerNormalized ? ('tshego' as ParticipantId) : slugifyId(normalized)

    const uniqueId = participantsById.has(id) ? (`${id}-${participantsById.size + 1}` as ParticipantId) : id
    nameToId.set(key, uniqueId)
    participantsById.set(uniqueId, { id: uniqueId, name: normalized })
    return uniqueId
  }

  ensureParticipant(options.meName)
  ensureParticipant(options.partnerName)

  const messages: ChatMessage[] = []

  const lines = raw.split(/\r?\n/g)
  let lastMessage: ChatMessage | null = null

  for (const line of lines) {
    const trimmed = line.trimEnd()
    if (!trimmed) continue

    const parsed = parseLine(trimmed)
    if (!parsed) {
      if (lastMessage) {
        const more = stripInlineAttachments(sanitizeText(trimmed.replace(bidiPrefixPattern, '')))
        if (more && !encryptionBannerPattern.test(more) && !/^<attached:/i.test(more)) {
          lastMessage.text = `${lastMessage.text}\n${more}`.trim()
        }
      }
      continue
    }

    if (parsed.isAttachment) continue
    if (!parsed.senderRaw || !parsed.text) {
      lastMessage = null
      continue
    }

    const senderId = ensureParticipant(parsed.senderRaw)
    const id = `wa_${messages.length + 1}`
    const msg: ChatMessage = { id, timestamp: parsed.timestamp, senderId, text: parsed.text }
    messages.push(msg)
    lastMessage = msg
  }

  const participants = [...participantsById.values()]
  const me =
    participants.find((p) => p.id === 'tadi') ?? ({ id: 'tadi' as ParticipantId, name: options.meName, accent: '#a2436d' } as ChatParticipant)
  const partner =
    participants.find((p) => p.id === 'tshego') ??
    ({ id: 'tshego' as ParticipantId, name: options.partnerName, accent: '#b85b4b' } as ChatParticipant)

  if (!me.accent) me.accent = '#a2436d'
  if (!partner.accent) partner.accent = '#b85b4b'

  const finalParticipants = [me, partner, ...participants.filter((p) => p.id !== 'tadi' && p.id !== 'tshego')]

  return {
    meta: {
      title: 'relationship wrapped',
      fromName: options.meName,
      partnerName: options.partnerName,
      relationshipLabel: 'us, in small moments',
      heroHeadline: 'If we could rewind us…',
      heroSubtext: 'I turned our conversations into something you can feel.',
    },
    participants: finalParticipants,
    messages,
  }
}
