import { EmptyState } from './EmptyState'
import { MessageList } from './MessageList'
import { MessageComposer } from './MessageComposer'
import type { ConversationPanelProps } from '../types/ui'
import { MESSAGING_TEXT } from '../constants/messaging'

export function ConversationPanel({
  selectedConversationId,
  partnerName,
  loggedUserId,
  messages,
  isLoading,
  error,
  onRetry,
  onSendMessage,
  onBack,
}: ConversationPanelProps) {
  const hasSelection = selectedConversationId !== null

  return (
    <section
      aria-label={MESSAGING_TEXT.conversations.itemLabel}
      className="flex h-full min-h-0 flex-col bg-white"
    >
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-zinc-200 bg-zinc-100 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          {hasSelection ? (
            <button
              type="button"
              onClick={onBack}
              className="rounded-md px-2 py-1 text-sm font-medium text-brand hover:bg-orange-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand md:hidden"
            >
              {MESSAGING_TEXT.conversations.back}
            </button>
          ) : null}
          <h2 className="truncate text-sm font-semibold text-zinc-900">
            {partnerName ?? MESSAGING_TEXT.conversations.itemLabel}
          </h2>
        </div>
      </div>

      <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain p-4">
        {!hasSelection ? (
          <EmptyState
            title={MESSAGING_TEXT.conversations.selectedTitle}
            description={MESSAGING_TEXT.conversations.selectedDescription}
          />
        ) : (
          <MessageList
            messages={messages}
            loggedUserId={loggedUserId}
            isLoading={isLoading}
            error={error}
            onRetry={onRetry}
          />
        )}
      </div>

      {hasSelection ? (
        <MessageComposer
          disabled={isLoading}
          onSubmit={onSendMessage}
        />
      ) : null}
    </section>
  )
}
