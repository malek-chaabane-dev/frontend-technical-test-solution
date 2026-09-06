import { getUsers } from '../users-api'

describe('getUsers', () => {
  afterEach(() => {
    Object.defineProperty(global, 'fetch', {
      value: undefined,
      configurable: true,
      writable: true,
    })
  })

  it('requests the users endpoint and validates the response', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ id: 2, nickname: 'Jeremie', token: 'token' }],
    } as Response)
    global.fetch = fetchMock

    await expect(getUsers()).resolves.toEqual([
      { id: 2, nickname: 'Jeremie', token: 'token' },
    ])
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3005/users', {
      signal: undefined,
    })
  })
})