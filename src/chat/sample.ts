import type { ChatData } from './types'

export const sampleChatData: ChatData = {
  meta: {
    title: 'A relationship wrapped',
    fromName: 'Tadi',
    partnerName: 'Tshego',
    relationshipLabel: 'us, in small moments',
    heroHeadline: 'If we could rewind us…',
    heroSubtext: 'I turned our conversations into something you can feel.',
    peakHeadline: 'Somewhere between “goodnight” and “are you home?”',
    peakBody:
      'We built a language out of ordinary days. Not loud, not perfect — just honest. I didn’t fall for a highlight reel. I fell for the way you kept showing up: in jokes, in patience, in the small care you didn’t even realize you were giving.',
    letterTitle: 'A note I’ve been carrying',
    letterBody:
      'I love the version of me that exists around you. The softer one. The braver one. The one who stops pretending they don’t need anybody.\n\nThank you for the way you listen — the kind that makes space, not noise. Thank you for the days you were tired and still stayed. Thank you for making “us” feel like something I can rest inside.\n\nIf this year taught me anything, it’s that love is a habit. It’s a thousand tiny choices that say: I’m here. I’m still here.',
    finalLine: 'I choose you. Again. Today. Quietly, and completely.',
  },
  participants: [
    { id: 'tadi', name: 'Tadi', accent: '#a2436d' },
    { id: 'tshego', name: 'Tshego', accent: '#b85b4b' },
  ],
  messages: [
    { id: 'm1', timestamp: '2026-03-21T22:32:50.000Z', senderId: 'tshego', text: 'Hey' },
    { id: 'm2', timestamp: '2026-03-23T08:06:46.000Z', senderId: 'tadi', text: 'Good morning beautiful' },
    { id: 'm3', timestamp: '2026-03-26T12:14:53.000Z', senderId: 'tadi', text: 'Let’s just say it would involve good vibes, a bit of trouble, a lot of laughter and you not wanting to leave 🤭' },
    { id: 'm4', timestamp: '2026-03-31T22:32:33.000Z', senderId: 'tadi', text: 'Your voice 😍🥰' },
    { id: 'm5', timestamp: '2026-04-02T10:52:06.000Z', senderId: 'tadi', text: 'Have you seen what you look like? I wouldn’t want to get my eyes off you even for a second' },
    { id: 'm6', timestamp: '2026-04-02T20:00:21.000Z', senderId: 'tshego', text: 'I know and I appreciate you guys🥹❤️' },
  ],
  events: [
    {
      date: '2026-03-26',
      title: 'June became a promise',
      caption: 'Not rushed. Not forced. Just real — and chosen.',
      snippet: 'June does sound like a safer plan… a whole week with me.',
      mood: 'milestone',
    },
  ],
  quotes: [
    { id: 'q1', by: 'tshego', date: '2026-04-01', text: 'I’ll be fine babe😊' },
    { id: 'q2', by: 'tadi', date: '2026-03-31', text: 'Your voice 😍🥰' },
  ],
}
