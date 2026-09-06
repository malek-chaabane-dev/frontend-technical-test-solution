import type { ErrorStateProps } from '../types/ui'

export function ErrorState({
  onRetry,
  message = 'Impossible de charger les conversations.',
}: ErrorStateProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-6 py-10 text-center">
      <p className="text-sm text-zinc-600">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-md bg-brand px-3 py-2 text-sm font-semibold text-white hover:bg-brand-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
      >
        Réessayer
      </button>
    </div>
  )
}