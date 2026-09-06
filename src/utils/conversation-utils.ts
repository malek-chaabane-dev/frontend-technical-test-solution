import type { Conversation } from '../types/conversation'

export function getConversationPartner(
  conversation: Conversation,
  loggedUserId: number,
): string {
  return conversation.senderId === loggedUserId
    ? conversation.recipientNickname
    : conversation.senderNickname
}

export function formatConversationTimestamp(timestamp: number): string {
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(timestamp * 1000))
}