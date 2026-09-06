import type { MessageBubbleProps } from '../types/ui'

function formatMessageTimestamp(timestamp: string): string {
  const numericTimestamp = Number(timestamp)
  const date = new Date(
    Number.isFinite(numericTimestamp) ? numericTimestamp * 1000 : timestamp,
  )

  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date)
}

export function MessageBubble({ message, isMine }: MessageBubbleProps) {
  return (
    <li className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
      <article
        aria-label={isMine ? 'Message envoyé' : 'Message reçu'}
        className={`max-w-[min(85%,36rem)] rounded-2xl px-4 py-3 ${
          isMine ? 'rounded-br-sm bg-brand text-white' : 'rounded-bl-sm bg-zinc-100 text-zinc-900'
        }`}
      >
        <p className="whitespace-pre-wrap break-words text-sm">{message.body}</p>
        <time
          dateTime={message.timestamp}
          className={`mt-2 block text-xs ${isMine ? 'text-orange-100' : 'text-zinc-500'}`}
        >
          {formatMessageTimestamp(message.timestamp)}
        </time>
      </article>
    </li>
  )
}