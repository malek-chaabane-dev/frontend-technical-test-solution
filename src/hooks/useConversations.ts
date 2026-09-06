import { useCallback, useEffect, useState } from 'react'
import { getConversations } from '../services/conversations-api'
import type { Conversation } from '../types/conversation'

type UseConversationsResult = {
  conversations: Conversation[]
  isLoading: boolean
  error: Error | null
  retry: () => void
}

export function useConversations(userId: number): UseConversationsResult {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [requestKey, setRequestKey] = useState(0)

  const retry = useCallback(() => {
    setRequestKey((currentKey) => currentKey + 1)
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    setIsLoading(true)
    setError(null)

    getConversations(userId, controller.signal)
      .then((nextConversations) => {
        setConversations(nextConversations)
      })
      .catch((requestError: unknown) => {
        if (requestError instanceof DOMException && requestError.name === 'AbortError') {
          return
        }

        setError(
          requestError instanceof Error
            ? requestError
            : new Error('Le chargement des conversations a échoué.'),
        )
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      })

    return () => controller.abort()
  }, [requestKey, userId])

  return { conversations, isLoading, error, retry }
}