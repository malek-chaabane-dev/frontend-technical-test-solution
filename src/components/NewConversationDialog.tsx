import type { FormEvent } from 'react'
import type { User } from '../types/user'

type NewConversationDialogProps = {
  users: User[]
  isLoadingUsers: boolean
  isSubmitting: boolean
  error: string | null
  onClose: () => void
  onSubmit: (recipientId: number) => Promise<void>
}

export function NewConversationDialog({
  users,
  isLoadingUsers,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}: NewConversationDialogProps) {
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const recipientId = Number(formData.get('recipientId'))

    if (!Number.isInteger(recipientId) || recipientId <= 0) {
      return
    }

    await onSubmit(recipientId)
  }

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-zinc-900/40 px-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-conversation-title"
        className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id="new-conversation-title" className="text-lg font-semibold text-zinc-900">
            Nouvelle conversation
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Fermer"
            className="rounded-md px-2 py-1 text-sm text-zinc-500 hover:bg-zinc-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-50"
          >
            Fermer
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label htmlFor="recipient-id" className="block text-sm font-medium text-zinc-800">
              Destinataire
            </label>
            <select
              id="recipient-id"
              name="recipientId"
              defaultValue=""
              disabled={isLoadingUsers || isSubmitting}
              required
              className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-brand focus:outline-none focus:ring-2 focus:ring-orange-100 disabled:bg-zinc-100"
            >
              <option value="" disabled>
                {isLoadingUsers ? 'Chargement...' : 'Sélectionner un utilisateur'}
              </option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.nickname}
                </option>
              ))}
            </select>
          </div>

          {error ? (
            <p role="alert" className="text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-md px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoadingUsers || isSubmitting || users.length === 0}
              className="rounded-md bg-brand px-3 py-2 text-sm font-semibold text-white hover:bg-brand-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:bg-zinc-300"
            >
              {isSubmitting ? 'Création...' : 'Créer'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}
