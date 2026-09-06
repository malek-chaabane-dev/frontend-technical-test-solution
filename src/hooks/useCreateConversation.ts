import { useCallback, useState } from 'react'
import { createConversation } from '../services/conversations-api'
import { ApiError } from '../services/api-client'
import type { Conversation } from '../types/conversation'
import { findConversationWithUser } from '../utils/conversation-utils'
import { MESSAGING_TEXT } from '../constants/messaging'

type UseCreateConversationResult = {
  create: (recipientId: number) => Promise<number | null>
  isCreating: boolean
  error: Error | null
  resetError: () => void
}

export function useCreateConversation(
  loggedUserId: number,
  conversations: Conversation[],
): UseCreateConversationResult {
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const resetError = useCallback(() => setError(null), [])

  const create = useCallback(
    async (recipientId: number): Promise<number | null> => {
      if (findConversationWithUser(conversations, loggedUserId, recipientId)) {
        const duplicateError = new ApiError(
          MESSAGING_TEXT.errors.duplicateConversation,
          400,
        )
        setError(duplicateError)
        return null
      }

      setIsCreating(true)
      setError(null)

      try {
        return await createConversation(loggedUserId, recipientId)
      } catch (requestError: unknown) {
        const normalizedError =
          requestError instanceof Error
            ? requestError
            : new Error(MESSAGING_TEXT.errors.conversationCreateFallback)
        setError(normalizedError)
        return null
      } finally {
        setIsCreating(false)
      }
    },
    [conversations, loggedUserId],
  )

  return { create, isCreating, error, resetError }
}