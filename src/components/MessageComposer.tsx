import { useState } from 'react'
import type { FormEvent, KeyboardEvent } from 'react'

type MessageComposerProps = {
  disabled: boolean
  onSubmit: (body: string) => Promise<void>
}

export function MessageComposer({ disabled, onSubmit }: MessageComposerProps) {
  const [body, setBody] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEmpty = body.trim() === ''
  const isDisabled = disabled || isSubmitting

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (isDisabled || isEmpty) {
      return
    }

    setError(null)
    setIsSubmitting(true)

    try {
      await onSubmit(body.trim())
      setBody('')
    } catch {
      setError("Le message n'a pas pu être envoyé. Vérifiez votre connexion et réessayez.")
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      event.currentTarget.form?.requestSubmit()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border-t border-zinc-200 bg-white p-3">
      {error ? (
        <p role="alert" className="mb-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      <div className="flex items-end gap-2">
        <label htmlFor="message-body" className="sr-only">
          Votre message
        </label>
        <textarea
          id="message-body"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Écrire un message"
          rows={1}
          disabled={isDisabled}
          className="min-h-10 min-w-0 flex-1 resize-y rounded-xl border border-zinc-300 px-4 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-brand focus:ring-2 focus:ring-orange-100 disabled:bg-zinc-100"
        />
        <button
          type="submit"
          disabled={isDisabled || isEmpty}
          className="shrink-0 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:bg-zinc-300"
        >
          {isDisabled ? 'Envoi...' : 'Envoyer'}
        </button>
      </div>
    </form>
  )
}