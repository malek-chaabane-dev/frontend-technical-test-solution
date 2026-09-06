import type { Conversation } from './conversation'
import type { Message } from './message'
import type { User } from './user'

export type ConversationListProps = {
  conversations: Conversation[]
  loggedUserId: number
  isLoading: boolean
  error: Error | null
  onRetry: () => void
  onSelect: (conversationId: number) => void
}

export type ConversationPanelProps = {
  selectedConversationId: number | null
  partnerName: string | null
  loggedUserId: number
  messages: Message[]
  isLoading: boolean
  error: Error | null
  onRetry: () => void
  onSendMessage: (body: string) => Promise<void>
  onBack: () => void
}

export type NewConversationDialogProps = {
  users: User[]
  isLoadingUsers: boolean
  isSubmitting: boolean
  error: string | null
  onClose: () => void
  onSubmit: (recipientId: number) => Promise<void>
}

export type EmptyStateProps = {
  title: string
  description: string
}

export type ErrorStateProps = {
  onRetry: () => void
  message?: string
}

export type LoadingStateProps = {
  label: string
}

export type ConversationListItemProps = {
  conversation: Conversation
  loggedUserId: number
  onSelect: (conversationId: number) => void
}

export type MessageBubbleProps = {
  message: Message
  isMine: boolean
}

export type MessageListProps = {
  messages: Message[]
  loggedUserId: number
  isLoading: boolean
  error: Error | null
  onRetry: () => void
}

export type MessageComposerProps = {
  disabled: boolean
  onSubmit: (body: string) => Promise<void>
}
