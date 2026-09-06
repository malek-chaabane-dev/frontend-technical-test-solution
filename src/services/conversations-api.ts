import { createValidationError, getJson, postJson } from './api-client'
import type { Conversation } from '../types/conversation'

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
    throw createValidationError('L’identifiant utilisateur est invalide.')
  }

  const response = await getJson<unknown>(
    `/conversations/${encodeURIComponent(String(userId))}`,
    signal,
  )

  if (!Array.isArray(response) || !response.every(isConversation)) {
    throw createValidationError('La réponse des conversations est invalide.')
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
    throw createValidationError('L’identifiant utilisateur est invalide.')
  }

  if (!Number.isInteger(recipientId) || recipientId <= 0) {
    throw createValidationError('Le destinataire est invalide.')
  }

  const response = await postJson<unknown>(
    `/conversations/${encodeURIComponent(String(userId))}`,
    { recipientId },
    'La conversation',
  )

  if (!isCreatedConversationResponse(response)) {
    throw createValidationError('La réponse de création de conversation est invalide.')
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