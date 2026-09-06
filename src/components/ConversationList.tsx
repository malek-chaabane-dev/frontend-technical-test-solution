import { EmptyState } from './EmptyState'

export function ConversationList() {
  return (
    <nav
      aria-label="Conversations"
      className="flex h-full min-h-0 flex-col border-zinc-200 bg-white md:border-r"
    >
      <div className="shrink-0 border-b border-zinc-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-zinc-900">Conversations</h2>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <EmptyState
          title="Aucune conversation"
          description="Vos conversations apparaîtront ici une fois chargées."
        />
      </div>
    </nav>
  )
}
