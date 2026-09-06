import { act, renderHook, waitFor } from '@testing-library/react'
import { useCreateConversation } from '../useCreateConversation'
import type { Conversation } from '../../types/conversation'
import { MESSAGING_TEXT } from '../../constants/messaging'

const existingConversation: Conversation = {
  id: 1,
  senderId: 1,
  senderNickname: 'Thibaut',
  recipientId: 2,
  recipientNickname: 'Jeremie',
  lastMessageTimestamp: 10,
}

describe('useCreateConversation', () => {
  afterEach(() => {
    Object.defineProperty(global, 'fetch', {
      value: undefined,
      configurable: true,
      writable: true,
    })
  })

  it('rejects a duplicate conversation without calling the API', async () => {
    const fetchMock = jest.fn()
    global.fetch = fetchMock
    const { result } = renderHook(() => useCreateConversation(1, [existingConversation]))

    let createdConversationId: number | null = null
    await act(async () => {
      createdConversationId = await result.current.create(2)
    })

    expect(createdConversationId).toBeNull()
    expect(result.current.error?.message).toBe(
      MESSAGING_TEXT.errors.duplicateConversation,
    )
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('creates a conversation and exposes its id', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 3 }),
    } as Response)
    const { result } = renderHook(() => useCreateConversation(1, []))

    let createdConversationId: number | null = null
    await act(async () => {
      createdConversationId = await result.current.create(2)
    })

    expect(createdConversationId).toBe(3)
    await waitFor(() => expect(result.current.isCreating).toBe(false))
    expect(result.current.error).toBeNull()
  })
})
