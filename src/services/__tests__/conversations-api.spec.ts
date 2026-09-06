import { getConversations } from '../conversations-api'

describe('getConversations', () => {
  afterEach(() => {
    delete global.fetch
  })

  it('requests the Swagger endpoint and sorts conversations by recency', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
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
    global.fetch = fetchMock

    const conversations = await getConversations(1)

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:3005/conversations/1',
      { signal: undefined },
    )
    expect(conversations.map(({ id }) => id)).toEqual([2, 1])
  })

  it('rejects an unexpected response shape', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ conversations: [] }),
    } as Response)

    await expect(getConversations(1)).rejects.toThrow(
      'La réponse des conversations est invalide.',
    )
  })

  it('does not call the API for an invalid user id', async () => {
    const fetchMock = jest.fn()
    global.fetch = fetchMock

    await expect(getConversations(0)).rejects.toThrow(
      "L’identifiant utilisateur est invalide.",
    )
    expect(fetchMock).not.toHaveBeenCalled()
  })
})