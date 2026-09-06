import { act, renderHook, waitFor } from '@testing-library/react'
import { useConversations } from '../useConversations'

describe('useConversations', () => {
  afterEach(() => {
    Object.defineProperty(global, 'fetch', {
      value: undefined,
      configurable: true,
      writable: true,
    })
  })

  it('moves a conversation to the top after a new message timestamp', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        {
          id: 1,
          senderId: 1,
          senderNickname: 'Thibaut',
          recipientId: 2,
          recipientNickname: 'Jeremie',
          lastMessageTimestamp: 10,
        },
        {
          id: 2,
          senderId: 1,
          senderNickname: 'Thibaut',
          recipientId: 3,
          recipientNickname: 'Patrick',
          lastMessageTimestamp: 20,
        },
      ],
    } as Response)

    const { result } = renderHook(() => useConversations(1))

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    act(() => {
      result.current.updateConversationTimestamp(1, 30)
    })

    expect(result.current.conversations.map(({ id }) => id)).toEqual([1, 2])
  })
})