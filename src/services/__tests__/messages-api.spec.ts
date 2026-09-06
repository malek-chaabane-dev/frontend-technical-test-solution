import { getMessages } from '../messages-api'
import { MESSAGING_TEXT } from '../../constants/messaging'

describe('getMessages', () => {
  afterEach(() => {
    Object.defineProperty(global, 'fetch', {
      value: undefined,
      configurable: true,
      writable: true,
    })
  })

  it('requests the conversation endpoint, normalizes timestamps, and sorts chronologically', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        {
          id: 2,
          conversationId: 1,
          authorId: 2,
          timestamp: 20,
          body: 'Second',
        },
        {
          id: 1,
          conversationId: 1,
          authorId: 1,
          timestamp: 10,
          body: 'First',
        },
      ],
    } as Response)
    global.fetch = fetchMock

    const messages = await getMessages(1)

    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3005/messages/1', {
      signal: undefined,
    })
    expect(messages.map(({ id }) => id)).toEqual([1, 2])
    expect(messages[0]?.timestamp).toBe('10')
  })

  it('rejects an unexpected response shape', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ id: 1 }],
    } as Response)

    await expect(getMessages(1)).rejects.toThrow(MESSAGING_TEXT.errors.invalidMessagesResponse)
  })

  it('rejects a message with an invalid timestamp', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        {
          id: 1,
          conversationId: 1,
          authorId: 1,
          timestamp: 'not-a-date',
          body: 'Bonjour',
        },
      ],
    } as Response)

    await expect(getMessages(1)).rejects.toThrow(MESSAGING_TEXT.errors.invalidTimestamp)
  })
})