export type ParticipantId = string

export type RelationshipWrappedTone = 'curiosity' | 'nostalgia' | 'playful' | 'peak' | 'resolution'

export type ChatEventMood = 'sweet' | 'funny' | 'hard' | 'milestone'

export interface ChatParticipant {
  id: ParticipantId
  name: string
  accent?: string
}

export interface ChatMessage {
  id: string
  timestamp: string
  senderId: ParticipantId
  text: string
}

export interface TimelineEvent {
  date: string
  title: string
  caption: string
  snippet?: string
  mood?: ChatEventMood
}

export interface ChatQuote {
  id: string
  text: string
  by?: ParticipantId
  date?: string
}

export interface WrappedMeta {
  title?: string
  fromName?: string
  partnerName?: string
  relationshipLabel?: string
  heroHeadline?: string
  heroSubtext?: string
  peakHeadline?: string
  peakBody?: string
  letterTitle?: string
  letterBody?: string
  finalLine?: string
}

export interface ChatData {
  meta?: WrappedMeta
  participants: ChatParticipant[]
  messages: ChatMessage[]
  events?: TimelineEvent[]
  quotes?: ChatQuote[]
}

