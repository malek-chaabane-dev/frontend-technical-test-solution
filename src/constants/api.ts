export const API_PATHS = {
  users: '/users',
  conversations: (userId: number) => `/conversations/${encodeURIComponent(String(userId))}`,
  messages: (conversationId: number) =>
    `/messages/${encodeURIComponent(String(conversationId))}`,
} as const
