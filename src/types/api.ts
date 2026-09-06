export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error'

export type ResourceType = 'message' | 'conversation'

export type AsyncState<T> = {
  status: AsyncStatus
  data: T
  error: Error | null
}
