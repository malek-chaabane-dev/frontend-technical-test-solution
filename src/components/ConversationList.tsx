import { EmptyState } from './EmptyState'
import { ErrorState } from './ErrorState'
import { LoadingState } from './LoadingState'
import { ConversationListItem } from './ConversationListItem'
import type { ConversationListProps } from '../types/ui'
import { MESSAGING_TEXT } from '../constants/messaging'

export function ConversationList({
  conversations,
  loggedUserId,
  isLoading,
  error,
  onRetry,
  onSelect,
}: ConversationListProps) {
  return (
    <nav
      aria-label={MESSAGING_TEXT.conversations.navigationLabel}
      className="flex h-full min-h-0 flex-col border-zinc-200 bg-white md:border-r"
    >
      <div className="shrink-0 border-b border-zinc-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-zinc-900">{MESSAGING_TEXT.conversations.title}</h2>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {isLoading ? <LoadingState label={MESSAGING_TEXT.common.loading} /> : null}
        {!isLoading && error ? <ErrorState message={error.message} onRetry={onRetry} /> : null}
        {!isLoading && !error && conversations.length === 0 ? (
          <EmptyState
            title={MESSAGING_TEXT.conversations.emptyTitle}
            description={MESSAGING_TEXT.conversations.emptyDescription}
          />
        ) : null}
        {!isLoading && !error && conversations.length > 0 ? (
          <ul>
            {conversations.map((conversation) => (
              <ConversationListItem
                key={conversation.id}
                conversation={conversation}
                loggedUserId={loggedUserId}
                onSelect={onSelect}
              />
            ))}
          </ul>
        ) : null}
      </div>
    </nav>
  )
}
