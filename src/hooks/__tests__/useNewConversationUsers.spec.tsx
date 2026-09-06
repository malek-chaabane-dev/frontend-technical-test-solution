import { renderHook, waitFor } from '@testing-library/react'
import { useNewConversationUsers } from '../useNewConversationUsers'

describe('useNewConversationUsers', () => {
  afterEach(() => {
    Object.defineProperty(global, 'fetch', {
      value: undefined,
      configurable: true,
      writable: true,
    })
  })

  it('loads users and excludes the logged user', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        { id: 1, nickname: 'Thibaut', token: 'token' },
        { id: 2, nickname: 'Jeremie', token: 'token' },
      ],
    } as Response)

    const { result } = renderHook(() => useNewConversationUsers(true, 1))

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    expect(result.current.users).toEqual([
      { id: 2, nickname: 'Jeremie' },
    ])
    expect(result.current.error).toBeNull()
  })

  it('does not request users while the dialog is closed', () => {
    const fetchMock = jest.fn()
    global.fetch = fetchMock

    renderHook(() => useNewConversationUsers(false, 1))

    expect(fetchMock).not.toHaveBeenCalled()
  })
})