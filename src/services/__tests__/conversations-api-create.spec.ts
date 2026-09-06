import { createConversation } from '../conversations-api'

describe('createConversation', () => {
  afterEach(() => {
    Object.defineProperty(global, 'fetch', {
      value: undefined,
      configurable: true,
      writable: true,
    })
  })

  it('posts the recipient id to the documented endpoint', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 12 }),
    } as Response)
    global.fetch = fetchMock

    await expect(createConversation(1, 2)).resolves.toBe(12)
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3005/conversations/1', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipientId: 2 }),
    })
  })

  it('rejects an invalid recipient before calling the API', async () => {
    const fetchMock = jest.fn()
    global.fetch = fetchMock

    await expect(createConversation(1, 0)).rejects.toThrow('Le destinataire est invalide.')
    expect(fetchMock).not.toHaveBeenCalled()
  })
})