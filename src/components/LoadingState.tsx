type LoadingStateProps = {
  label: string
}

export function LoadingState({ label }: LoadingStateProps) {
  return (
    <div role="status" className="flex h-full items-center justify-center px-6 py-10 text-sm text-zinc-500">
      {label}
    </div>
  )
}