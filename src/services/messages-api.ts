import { createValidationError, getJson, postJson } from './api-client'
import type { Message } from '../types/message'
import { API_PATHS } from '../constants/api'
import { MESSAGING_TEXT } from '../constants/messaging'

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
    throw createValidationError(MESSAGING_TEXT.errors.invalidConversationId)
  }

  const response = await getJson<unknown>(
    API_PATHS.messages(conversationId),
    signal,
  )

  if (!Array.isArray(response) || !response.every(isMessage)) {
    throw createValidationError(MESSAGING_TEXT.errors.invalidMessagesResponse)
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
    throw createValidationError(MESSAGING_TEXT.errors.invalidTimestamp)
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
    throw createValidationError(MESSAGING_TEXT.errors.invalidConversationId)
  }

  if (!Number.isInteger(authorId) || authorId <= 0) {
    throw createValidationError(MESSAGING_TEXT.errors.invalidAuthorId)
  }

  if (body.trim() === '' || !Number.isInteger(timestamp) || timestamp < 0) {
    throw createValidationError(MESSAGING_TEXT.errors.invalidMessageContent)
  }

  const response = await postJson<unknown>(
    API_PATHS.messages(conversationId),
    { body, timestamp },
  )

  if (!isCreateMessageResponse(response)) {
    throw createValidationError(MESSAGING_TEXT.errors.invalidMessageCreationResponse)
  }

  return {
    id: response.id,
    conversationId,
    authorId,
    timestamp: String(timestamp),
    body,
  }
}