import type { EmptyStateProps } from '../types/ui'

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 px-6 py-10 text-center">
      <p className="text-base font-medium text-zinc-800">{title}</p>
      <p className="max-w-sm text-sm text-zinc-500">{description}</p>
    </div>
  )
}
