import {
  formatConversationTimestamp,
  getConversationPartner,
} from '../utils/conversation-utils'
import type { ConversationListItemProps } from '../types/ui'

export function ConversationListItem({
  conversation,
  loggedUserId,
  onSelect,
}: ConversationListItemProps) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(conversation.id)}
        className="flex w-full items-center justify-between gap-3 border-b border-zinc-100 px-4 py-4 text-left transition hover:bg-orange-50 focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand"
      >
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-zinc-900">
            {getConversationPartner(conversation, loggedUserId)}
          </span>
          <span className="mt-1 block text-xs text-zinc-500">Conversation</span>
        </span>
        <time
          dateTime={new Date(conversation.lastMessageTimestamp * 1000).toISOString()}
          className="shrink-0 text-xs text-zinc-500"
        >
          {formatConversationTimestamp(conversation.lastMessageTimestamp)}
        </time>
      </button>
    </li>
  )
}