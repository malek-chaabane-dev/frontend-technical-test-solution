import { getJson } from '../api-client'
import { MESSAGING_TEXT } from '../../constants/messaging'

describe('api-client', () => {
  afterEach(() => {
    Object.defineProperty(global, 'fetch', {
      value: undefined,
      configurable: true,
      writable: true,
    })
  })

  it('normalizes a 503 response', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 503 } as Response)

    await expect(getJson('/conversations/1')).rejects.toMatchObject({
      name: 'ApiError',
      status: 503,
      message: MESSAGING_TEXT.errors.serviceUnavailable,
    })
  })

  it('reports an invalid JSON response', async () => {
    global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => {
            throw new SyntaxError('invalid json')
        },
    } as unknown as Response)

    await expect(getJson('/conversations/1')).rejects.toMatchObject({
      name: 'ApiError',
      message: MESSAGING_TEXT.errors.invalidResponse,
    })
  })

  it('normalizes a 404 response without treating it as data', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 404 } as Response)

    await expect(getJson('/messages/99')).rejects.toMatchObject({
      name: 'ApiError',
      status: 404,
      message: MESSAGING_TEXT.errors.resourceNotFound,
    })
  })

  it('preserves AbortError for hooks to ignore', async () => {
    const abortError = new Error('aborted')
    abortError.name = 'AbortError'
    global.fetch = jest.fn().mockRejectedValue(abortError)

    await expect(getJson('/messages/1')).rejects.toBe(abortError)
  })
})