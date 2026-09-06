import { act, renderHook, waitFor } from '@testing-library/react'
import { useConversationMessages } from '../useConversationMessages'

function message(id: number, conversationId: number) {
  return {
    id,
    conversationId,
    authorId: 1,
    timestamp: String(id),
    body: `Message ${id}`,
  }
}

describe('useConversationMessages', () => {
  afterEach(() => {
    delete global.fetch
  })

  it('ignores a stale response after changing conversation', async () => {
    let resolveFirst: ((response: Response) => void) | undefined
    let resolveSecond: ((response: Response) => void) | undefined

    global.fetch = jest.fn().mockImplementation((input: RequestInfo | URL) => {
      if (String(input).endsWith('/messages/1')) {
        return new Promise<Response>((resolve) => {
          resolveFirst = resolve
        })
      }

      return new Promise<Response>((resolve) => {
        resolveSecond = resolve
      })
    }) as typeof fetch

    const { result, rerender } = renderHook(
      ({ conversationId }: { conversationId: number }) =>
        useConversationMessages(conversationId),
      { initialProps: { conversationId: 1 } },
    )

    rerender({ conversationId: 2 })

    await act(async () => {
      resolveFirst?.({ ok: true, json: async () => [message(1, 1)] } as Response)
      resolveSecond?.({ ok: true, json: async () => [message(2, 2)] } as Response)
    })

    await waitFor(() => {
      expect(result.current.messages).toEqual([message(2, 2)])
      expect(result.current.error).toBeNull()
    })
  })
})