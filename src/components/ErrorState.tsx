import type { ErrorStateProps } from '../types/ui'
import { MESSAGING_TEXT } from '../constants/messaging'

export function ErrorState({
  onRetry,
  message = MESSAGING_TEXT.errors.conversationsLoadFallback,
}: ErrorStateProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-6 py-10 text-center">
      <p className="text-sm text-zinc-600">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-md bg-brand px-3 py-2 text-sm font-semibold text-white hover:bg-brand-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        {MESSAGING_TEXT.common.retry}
      </button>
    </div>
  )
}