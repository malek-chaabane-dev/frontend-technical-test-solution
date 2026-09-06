import { createValidationError, getJson, postJson } from './api-client'
import type { Conversation } from '../types/conversation'
import { API_PATHS } from '../constants/api'
import { MESSAGING_TEXT } from '../constants/messaging'

function isConversation(value: unknown): value is Conversation {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const conversation = value as Record<string, unknown>

  return (
    Number.isInteger(conversation.id) &&
    Number.isInteger(conversation.senderId) &&
    typeof conversation.senderNickname === 'string' &&
    conversation.senderNickname.trim() !== '' &&
    Number.isInteger(conversation.recipientId) &&
    typeof conversation.recipientNickname === 'string' &&
    conversation.recipientNickname.trim() !== '' &&
    typeof conversation.lastMessageTimestamp === 'number' &&
    Number.isFinite(conversation.lastMessageTimestamp)
  )
}

export async function getConversations(
  userId: number,
  signal?: AbortSignal,
): Promise<Conversation[]> {
  if (!Number.isInteger(userId) || userId <= 0) {
    throw createValidationError(MESSAGING_TEXT.errors.invalidUserId)
  }

  const response = await getJson<unknown>(
    API_PATHS.conversations(userId),
    signal,
  )

  if (!Array.isArray(response) || !response.every(isConversation)) {
    throw createValidationError(MESSAGING_TEXT.errors.invalidConversationsResponse)
  }

  return [...response].sort(
    (first, second) => second.lastMessageTimestamp - first.lastMessageTimestamp,
  )
}

export async function createConversation(
  userId: number,
  recipientId: number,
): Promise<number> {
  if (!Number.isInteger(userId) || userId <= 0) {
    throw createValidationError(MESSAGING_TEXT.errors.invalidUserId)
  }

  if (!Number.isInteger(recipientId) || recipientId <= 0) {
    throw createValidationError(MESSAGING_TEXT.errors.invalidRecipient)
  }

  const response = await postJson<unknown>(
    API_PATHS.conversations(userId),
    { recipientId },
    'conversation',
  )

  if (!isCreatedConversationResponse(response)) {
    throw createValidationError(MESSAGING_TEXT.errors.invalidConversationCreationResponse)
  }

  return response.id
}

function isCreatedConversationResponse(value: unknown): value is { id: number } {
  return (
    typeof value === 'object' &&
    value !== null &&
    Number.isInteger((value as Record<string, unknown>).id)
  )
}