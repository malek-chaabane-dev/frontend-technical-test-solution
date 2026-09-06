import { useCallback, useEffect, useState } from 'react'
import { getConversations } from '../services/conversations-api'
import { isAbortError } from '../services/api-client'
import type { Conversation } from '../types/conversation'
import type { AsyncState } from '../types/api'
import { MESSAGING_TEXT } from '../constants/messaging'

type UseConversationsResult = {
  conversations: Conversation[]
  isLoading: boolean
  error: Error | null
  retry: () => void
}

export function useConversations(userId: number): UseConversationsResult {
  const [state, setState] = useState<AsyncState<Conversation[]>>({
    status: 'loading',
    data: [],
    error: null,
  })
  const [requestKey, setRequestKey] = useState(0)

  const retry = useCallback(() => {
    setRequestKey((currentKey) => currentKey + 1)
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    setState((currentState) => ({ ...currentState, status: 'loading', error: null }))

    getConversations(userId, controller.signal)
      .then((nextConversations) => {
        setState({ status: 'success', data: nextConversations, error: null })
      })
      .catch((requestError: unknown) => {
        if (isAbortError(requestError)) {
          return
        }

        setState((currentState) => ({
          ...currentState,
          status: 'error',
          error:
            requestError instanceof Error
              ? requestError
              : new Error(MESSAGING_TEXT.errors.conversationsLoadFallback),
        }))
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setState((currentState) => ({
            ...currentState,
            status: currentState.error ? 'error' : 'success',
          }))
        }
      })

    return () => controller.abort()
  }, [requestKey, userId])

  return {
    conversations: state.data,
    isLoading: state.status === 'loading',
    error: state.error,
    retry,
  }
}