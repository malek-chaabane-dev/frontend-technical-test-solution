import { createValidationError, getJson, postJson } from './api-client'
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
    Number.isInteger(message.id) &&
    Number.isInteger(message.conversationId) &&
    Number.isInteger(message.authorId) &&
    (typeof message.timestamp === 'string' || typeof message.timestamp === 'number') &&
    typeof message.body === 'string' &&
    message.body.trim() !== ''
  )
}

export async function getMessages(
  conversationId: number,
  signal?: AbortSignal,
): Promise<Message[]> {
  if (!Number.isInteger(conversationId) || conversationId <= 0) {
    throw createValidationError('L’identifiant de conversation est invalide.')
  }

  const response = await getJson<unknown>(
    `/messages/${encodeURIComponent(String(conversationId))}`,
    signal,
  )

  if (!Array.isArray(response) || !response.every(isMessage)) {
    throw createValidationError('La réponse des messages est invalide.')
  }

  return response
    .map((message) => {
      const timestamp = String(message.timestamp)
      toTimestamp(timestamp)

      return {
        id: message.id,
        conversationId: message.conversationId,
        authorId: message.authorId,
        timestamp,
        body: message.body,
      }
    })
    .sort((first, second) => toTimestamp(first.timestamp) - toTimestamp(second.timestamp))
}

function toTimestamp(timestamp: string): number {
  const numericTimestamp = Number(timestamp)

  if (Number.isFinite(numericTimestamp)) {
    return numericTimestamp
  }

  const parsedTimestamp = Date.parse(timestamp)

  if (!Number.isFinite(parsedTimestamp)) {
    throw createValidationError('Le timestamp du message est invalide.')
  }

  return parsedTimestamp
}

type CreateMessageResponse = {
  id: number
}

function isCreateMessageResponse(value: unknown): value is CreateMessageResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Record<string, unknown>).id === 'number'
  )
}

export async function sendMessage(
  conversationId: number,
  authorId: number,
  body: string,
  timestamp: number,
): Promise<Message> {
  if (!Number.isInteger(conversationId) || conversationId <= 0) {
    throw createValidationError('L’identifiant de conversation est invalide.')
  }

  if (!Number.isInteger(authorId) || authorId <= 0) {
    throw createValidationError('L’identifiant auteur est invalide.')
  }

  if (body.trim() === '' || !Number.isInteger(timestamp) || timestamp < 0) {
    throw createValidationError('Le contenu du message est invalide.')
  }

  const response = await postJson<unknown>(
    `/messages/${encodeURIComponent(String(conversationId))}`,
    { body, timestamp },
  )

  if (!isCreateMessageResponse(response)) {
    throw createValidationError("La réponse de création du message est invalide.")
  }

  return {
    id: response.id,
    conversationId,
    authorId,
    timestamp: String(timestamp),
    body,
  }
}