import { EmptyState } from './EmptyState'
import { ErrorState } from './ErrorState'
import { LoadingState } from './LoadingState'
import { MessageBubble } from './MessageBubble'
import type { Message } from '../types/message'

type MessageListProps = {
  messages: Message[]
  loggedUserId: number
  isLoading: boolean
  error: Error | null
  onRetry: () => void
}

export function MessageList({
  messages,
  loggedUserId,
  isLoading,
  error,
  onRetry,
}: MessageListProps) {
  if (isLoading) {
    return <LoadingState label="Chargement des messages..." />
  }

  if (error) {
    return <ErrorState message={error.message} onRetry={onRetry} />
  }

  if (messages.length === 0) {
    return (
      <EmptyState
        title="Aucun message"
        description="Cette conversation ne contient pas encore de message."
      />
    )
  }

  return (
    <ul className="flex flex-col gap-3" aria-label="Messages">
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          message={message}
          isMine={message.authorId === loggedUserId}
        />
      ))}
    </ul>
  )
}