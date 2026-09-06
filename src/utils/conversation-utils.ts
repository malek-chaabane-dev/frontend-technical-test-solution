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

export function findConversationWithUser(
  conversations: Conversation[],
  loggedUserId: number,
  recipientId: number,
): Conversation | undefined {
  return conversations.find((conversation) => {
    const otherUserId =
      conversation.senderId === loggedUserId
        ? conversation.recipientId
        : conversation.senderId

    return otherUserId === recipientId
  })
}