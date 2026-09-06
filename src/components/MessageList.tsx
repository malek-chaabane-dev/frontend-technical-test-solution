import { EmptyState } from './EmptyState'
import { ErrorState } from './ErrorState'
import { LoadingState } from './LoadingState'
import { MessageBubble } from './MessageBubble'
import type { MessageListProps } from '../types/ui'
import { MESSAGING_TEXT } from '../constants/messaging'

export function MessageList({
  messages,
  loggedUserId,
  isLoading,
  error,
  onRetry,
}: MessageListProps) {
  if (isLoading) {
    return <LoadingState label={MESSAGING_TEXT.messages.loading} />
  }

  if (error) {
    return <ErrorState message={error.message} onRetry={onRetry} />
  }

  if (messages.length === 0) {
    return (
      <EmptyState
        title={MESSAGING_TEXT.messages.emptyTitle}
        description={MESSAGING_TEXT.messages.emptyDescription}
      />
    )
  }

  return (
    <ul className="flex flex-col gap-3" aria-label={MESSAGING_TEXT.messages.listLabel}>
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