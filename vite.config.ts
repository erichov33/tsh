import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { parseWhatsAppChatExport } from './src/chat/whatsapp'

const instagramSeed = [
  { id: 'ig_1', timestamp: '2026-03-07T15:27:00.000Z', senderId: 'tadi', text: '👀I don’t even know what to say but I wanna talk to you' },
  { id: 'ig_2', timestamp: '2026-03-07T15:28:00.000Z', senderId: 'tshego', text: 'Why?😂' },
  { id: 'ig_3', timestamp: '2026-03-07T15:29:00.000Z', senderId: 'tadi', text: 'I stared at your profile way too long trying to think of a clever opener… so here I am😂' },
  { id: 'ig_4', timestamp: '2026-03-07T15:30:00.000Z', senderId: 'tshego', text: 'Hectic looks like I got myself a stalker' },
  { id: 'ig_5', timestamp: '2026-03-07T15:31:00.000Z', senderId: 'tadi', text: 'Stalker is a strong word, I prefer “very curious admirer” 😂' },
  { id: 'ig_6', timestamp: '2026-03-07T15:32:00.000Z', senderId: 'tshego', text: 'Mmmh okay' },
  { id: 'ig_7', timestamp: '2026-03-07T15:33:00.000Z', senderId: 'tadi', text: 'Good… I was worried you were about to file a restraining order 😅\nSo besides accusing innocent people of stalking… what do you usually do for fun?' },
  { id: 'ig_8', timestamp: '2026-03-07T15:34:00.000Z', senderId: 'tshego', text: 'I go out with my friends' },
  { id: 'ig_9', timestamp: '2026-03-07T16:45:00.000Z', senderId: 'tadi', text: 'Why do I have a feeling you’re the one who convinces everyone to stay out way too late 😌' },
  { id: 'ig_10', timestamp: '2026-03-07T17:17:00.000Z', senderId: 'tshego', text: 'True 😂' },
  { id: 'ig_11', timestamp: '2026-03-07T17:18:00.000Z', senderId: 'tadi', text: 'I knew it 😂 you definitely have “bad influence” energy.\nI feel like going out with you would end with “just one more drink” turning into 5am.' },
  { id: 'ig_12', timestamp: '2026-03-07T17:47:00.000Z', senderId: 'tshego', text: 'Definitely 🤣\nMara I know my limits 😭' },
  { id: 'ig_13', timestamp: '2026-03-07T18:11:00.000Z', senderId: 'tadi', text: 'Okay can we put that to the test?' },
  { id: 'ig_14', timestamp: '2026-03-07T18:12:00.000Z', senderId: 'tshego', text: 'Maybe 👀' },
  { id: 'ig_15', timestamp: '2026-03-07T18:13:00.000Z', senderId: 'tadi', text: 'How about you get ready and then I’ll request for you, then we’ll see if we don’t get home at 5am😂' },
  { id: 'ig_16', timestamp: '2026-03-07T18:14:00.000Z', senderId: 'tshego', text: 'Yoh I can’t shem I’m still recovering from last night 😭' },
  { id: 'ig_17', timestamp: '2026-03-07T18:15:00.000Z', senderId: 'tadi', text: 'Okay fair… no wild night then 😌\nJust come out for one chilled drink with me tonight. Doctor’s orders for recovery.' },
  { id: 'ig_18', timestamp: '2026-03-07T18:16:00.000Z', senderId: 'tshego', text: 'I don’t know you tho👀' },
  { id: 'ig_19', timestamp: '2026-03-07T18:17:00.000Z', senderId: 'tadi', text: 'That’s exactly why we should meet 😂\nOtherwise I’ll just remain the mysterious Instagram stalker forever.' },
  { id: 'ig_20', timestamp: '2026-03-07T18:18:00.000Z', senderId: 'tshego', text: 'Mmmh but it’s risky' },
  { id: 'ig_21', timestamp: '2026-03-07T18:19:00.000Z', senderId: 'tadi', text: 'Risky? 👀\nRelax, we’re meeting somewhere public. If I’m weird you can escape after one drink 😂' },
  { id: 'ig_22', timestamp: '2026-03-07T18:20:00.000Z', senderId: 'tshego', text: 'Where in public?' },
  { id: 'ig_23', timestamp: '2026-03-07T18:21:00.000Z', senderId: 'tadi', text: 'Whatever is most convenient for you hey' },
  { id: 'ig_24', timestamp: '2026-03-07T18:22:00.000Z', senderId: 'tshego', text: 'Okay but one drink and then I’m going home to sleep 😭' },
] as const

function withInstagramSeed(data: ReturnType<typeof parseWhatsAppChatExport>) {
  const ids = new Set(data.messages.map((m) => m.id))
  const seed = instagramSeed.filter((m) => !ids.has(m.id))
  return { ...data, messages: [...seed, ...data.messages] }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'relationship-wrapped-whatsapp-source',
      configureServer(server) {
        const chatPath = '/Users/tadi/Downloads/_chat.txt'

        server.middlewares.use((req, res, next) => {
          if (!req.url?.startsWith('/chat.json')) return next()

          try {
            const raw = readFileSync(chatPath, 'utf8')
            const data = withInstagramSeed(parseWhatsAppChatExport(raw, { meName: 'Tadi', partnerName: 'Tshego' }))
            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            res.end(JSON.stringify(data))
          } catch {
            next()
          }
        })
      },
      buildStart() {
        const chatPath = '/Users/tadi/Downloads/_chat.txt'
        try {
          const raw = readFileSync(chatPath, 'utf8')
          const data = withInstagramSeed(parseWhatsAppChatExport(raw, { meName: 'Tadi', partnerName: 'Tshego' }))

          const publicDir = resolve(process.cwd(), 'public')
          if (!existsSync(publicDir)) mkdirSync(publicDir, { recursive: true })
          writeFileSync(resolve(publicDir, 'chat.json'), JSON.stringify(data, null, 2), 'utf8')
        } catch {
          return
        }
      },
    },
  ],
})
