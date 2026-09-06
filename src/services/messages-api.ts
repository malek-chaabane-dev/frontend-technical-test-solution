import { getJson } from './api-client'
import type { Message } from '../types/message'

type RawMessage = Omit<Message, 'timestamp'> & {
  timestamp: string | number
}

function isMessage(value: unknown): value is RawMessage {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const message = value as Record<string, unknown>

  return (
    typeof message.id === 'number' &&
    typeof message.conversationId === 'number' &&
    typeof message.authorId === 'number' &&
    (typeof message.timestamp === 'string' || typeof message.timestamp === 'number') &&
    typeof message.body === 'string'
  )
}

export async function getMessages(
  conversationId: number,
  signal?: AbortSignal,
): Promise<Message[]> {
  const response = await getJson<unknown>(
    `/messages/${encodeURIComponent(String(conversationId))}`,
    signal,
  )

  if (!Array.isArray(response) || !response.every(isMessage)) {
    throw new Error('La réponse des messages est invalide.')
  }

  return response
    .map((message) => ({
      id: message.id,
      conversationId: message.conversationId,
      authorId: message.authorId,
      timestamp: String(message.timestamp),
      body: message.body,
    }))
    .sort((first, second) => toTimestamp(first.timestamp) - toTimestamp(second.timestamp))
}

function toTimestamp(timestamp: string): number {
  const numericTimestamp = Number(timestamp)

  if (Number.isFinite(numericTimestamp)) {
    return numericTimestamp
  }

  return Date.parse(timestamp)
}