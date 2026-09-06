import { getJson } from './api-client'
import type { Conversation } from '../types/conversation'

function isConversation(value: unknown): value is Conversation {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const conversation = value as Record<string, unknown>

  return (
    typeof conversation.id === 'number' &&
    typeof conversation.senderId === 'number' &&
    typeof conversation.senderNickname === 'string' &&
    typeof conversation.recipientId === 'number' &&
    typeof conversation.recipientNickname === 'string' &&
    typeof conversation.lastMessageTimestamp === 'number'
  )
}

export async function getConversations(
  userId: number,
  signal?: AbortSignal,
): Promise<Conversation[]> {
  const response = await getJson<unknown>(
    `/conversations/${encodeURIComponent(String(userId))}`,
    signal,
  )

  if (!Array.isArray(response) || !response.every(isConversation)) {
    throw new Error('La réponse des conversations est invalide.')
  }

  return [...response].sort(
    (first, second) => second.lastMessageTimestamp - first.lastMessageTimestamp,
  )
}