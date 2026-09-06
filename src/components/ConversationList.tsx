import { EmptyState } from './EmptyState'
import { ErrorState } from './ErrorState'
import { LoadingState } from './LoadingState'
import { ConversationListItem } from './ConversationListItem'
import type { ConversationListProps } from '../types/ui'

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
      aria-label="Conversations"
      className="flex h-full min-h-0 flex-col border-zinc-200 bg-white md:border-r"
    >
      <div className="shrink-0 border-b border-zinc-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-zinc-900">Conversations</h2>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {isLoading ? <LoadingState label="Chargement des conversations..." /> : null}
        {!isLoading && error ? <ErrorState message={error.message} onRetry={onRetry} /> : null}
        {!isLoading && !error && conversations.length === 0 ? (
          <EmptyState
            title="Aucune conversation"
            description="Vous n'avez aucune conversation pour le moment."
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
