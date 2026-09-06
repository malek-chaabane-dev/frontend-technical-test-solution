import { sendMessage } from '../messages-api'

describe('sendMessage', () => {
  afterEach(() => {
    delete global.fetch
  })

  it('posts the body and Unix timestamp from the Swagger contract', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 42 }),
    } as Response)
    global.fetch = fetchMock

    await expect(sendMessage(7, 1, '  Bonjour  ', 123)).resolves.toEqual({
      id: 42,
      conversationId: 7,
      authorId: 1,
      timestamp: '123',
      body: '  Bonjour  ',
    })

    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3005/messages/7', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: '  Bonjour  ', timestamp: 123 }),
    })
  })

  it('rejects an invalid creation response', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    } as Response)

    await expect(sendMessage(7, 1, 'Bonjour', 123)).rejects.toThrow(
      "La réponse de création du message est invalide.",
    )
  })

  it('rejects an empty body before calling the API', async () => {
    const fetchMock = jest.fn()
    global.fetch = fetchMock

    await expect(sendMessage(7, 1, '   ', 123)).rejects.toThrow(
      'Le contenu du message est invalide.',
    )
    expect(fetchMock).not.toHaveBeenCalled()
  })
})