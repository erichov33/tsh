import type { ChatData } from './types'
import { sampleChatData } from './sample'

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function looksLikeChatData(value: unknown): value is ChatData {
  if (!isObject(value)) return false
  const participants = value.participants
  const messages = value.messages
  return Array.isArray(participants) && Array.isArray(messages)
}

export async function loadChatData(): Promise<ChatData> {
  try {
    const res = await fetch('/chat.json', { cache: 'no-store' })
    if (!res.ok) return sampleChatData
    const json = (await res.json()) as unknown
    if (!looksLikeChatData(json)) return sampleChatData
    return json
  } catch {
    return sampleChatData
  }
}

