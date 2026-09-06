import { useCallback, useEffect, useState } from 'react'
import { getMessages } from '../services/messages-api'
import type { Message } from '../types/message'

type UseConversationMessagesResult = {
  messages: Message[]
  isLoading: boolean
  error: Error | null
  retry: () => void
}

export function useConversationMessages(
  conversationId: number | null,
): UseConversationMessagesResult {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [requestKey, setRequestKey] = useState(0)

  const retry = useCallback(() => {
    setRequestKey((currentKey) => currentKey + 1)
  }, [])

  useEffect(() => {
    if (conversationId === null) {
      setMessages([])
      setIsLoading(false)
      setError(null)
      return
    }

    const controller = new AbortController()

    setMessages([])
    setIsLoading(true)
    setError(null)

    getMessages(conversationId, controller.signal)
      .then(setMessages)
      .catch((requestError: unknown) => {
        if (requestError instanceof DOMException && requestError.name === 'AbortError') {
          return
        }

        setError(
          requestError instanceof Error
            ? requestError
            : new Error('Le chargement des messages a échoué.'),
        )
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      })

    return () => controller.abort()
  }, [conversationId, requestKey])

  return { messages, isLoading, error, retry }
}