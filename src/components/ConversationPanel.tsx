import { EmptyState } from './EmptyState'

type ConversationPanelProps = {
  selectedConversationId: number | null
  onBack: () => void
}

export function ConversationPanel({
  selectedConversationId,
  onBack,
}: ConversationPanelProps) {
  const hasSelection = selectedConversationId !== null

  return (
    <section
      aria-label="Conversation"
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
              Retour
            </button>
          ) : null}
          <h2 className="truncate text-sm font-semibold text-zinc-900">
            Conversation
          </h2>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <EmptyState
          title="Aucune conversation sélectionnée"
          description="Sélectionnez une conversation pour afficher les messages."
        />
      </div>

      <div className="shrink-0 border-t border-zinc-200 bg-white p-3">
        <div className="flex items-center rounded-full border border-zinc-300 px-4 py-2 text-sm text-zinc-400">
          <span className="flex-1">Écrire un message</span>
          <span aria-hidden="true" className="text-zinc-400">
            →
          </span>
        </div>
      </div>
    </section>
  )
}
