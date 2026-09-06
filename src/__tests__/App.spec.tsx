import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import Home from '../pages'
import { MESSAGING_TEXT } from '../constants/messaging'

describe('Home messaging shell', () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    }) as typeof fetch
  })

  it('renders the conversations list and conversation panel', () => {
    render(<Home />)

    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: MESSAGING_TEXT.header.pageTitle })).toBeInTheDocument()
    expect(
      screen.getByRole('navigation', { name: MESSAGING_TEXT.conversations.navigationLabel }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('region', { name: MESSAGING_TEXT.conversations.itemLabel }),
    ).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent(
      MESSAGING_TEXT.common.loading,
    )

    return waitFor(() => {
      expect(screen.getByText(MESSAGING_TEXT.conversations.emptyTitle)).toBeInTheDocument()
      expect(
        screen.getByText(MESSAGING_TEXT.conversations.selectedTitle),
      ).toBeInTheDocument()
    })

    expect(screen.queryByText(/Welcome/)).not.toBeInTheDocument()
  })

  it('loads the selected conversation messages and identifies sent messages', async () => {
    global.fetch = jest.fn().mockImplementation((input: RequestInfo | URL) => {
      const url = String(input)

      if (url.endsWith('/conversations/1')) {
        return Promise.resolve({
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
          ],
        })
      }

      return Promise.resolve({
        ok: true,
        json: async () => [
          {
            id: 1,
            conversationId: 1,
            authorId: 1,
            timestamp: 10,
            body: 'Bonjour',
          },
          {
            id: 2,
            conversationId: 1,
            authorId: 2,
            timestamp: 20,
            body: 'Bonjour Jeremie',
          },
        ],
      })
    }) as typeof fetch

    render(<Home />)

    const conversation = await screen.findByRole('button', { name: /Jeremie/ })
    fireEvent.click(conversation)

    expect(await screen.findByText('Bonjour')).toBeInTheDocument()
    expect(screen.getByText('Bonjour Jeremie')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Jeremie' })).toBeInTheDocument()
    expect(screen.getByRole('article', { name: MESSAGING_TEXT.messages.sentLabel })).toBeInTheDocument()
    expect(screen.getByRole('article', { name: MESSAGING_TEXT.messages.receivedLabel })).toBeInTheDocument()
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:3005/messages/1', {
      signal: expect.any(AbortSignal),
    })
  })

  it('sends a non-empty message and keeps the composer locked while submitting', async () => {
    let resolveSend: ((response: Response) => void) | undefined
    global.fetch = jest.fn().mockImplementation((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)

      if (url.endsWith('/conversations/1')) {
        return Promise.resolve({
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
          ],
        })
      }

      if (init?.method === 'POST') {
        return new Promise<Response>((resolve) => {
          resolveSend = resolve
        })
      }

      return Promise.resolve({
        ok: true,
        json: async () => [],
      })
    }) as typeof fetch

    render(<Home />)
    fireEvent.click(await screen.findByRole('button', { name: /Jeremie/ }))

    const input = await screen.findByLabelText(MESSAGING_TEXT.messages.composerLabel)
    await waitFor(() => expect(input).toBeEnabled())
    fireEvent.change(input, { target: { value: 'Bonjour' } })
    fireEvent.submit(input.closest('form') as HTMLFormElement)

    expect(screen.getByRole('button', { name: MESSAGING_TEXT.messages.sending })).toBeDisabled()
    expect(screen.getByDisplayValue('Bonjour')).toBeInTheDocument()

    await act(async () => {
      resolveSend?.({ ok: true, json: async () => ({ id: 3 }) } as Response)
    })
    await waitFor(() => expect(screen.queryByDisplayValue('Bonjour')).not.toBeInTheDocument())
    expect(screen.getByRole('button', { name: MESSAGING_TEXT.messages.send })).toBeDisabled()
    expect(screen.getByText('Bonjour')).toBeInTheDocument()
  })

  it('keeps the message text when sending fails', async () => {
    global.fetch = jest.fn().mockImplementation((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)

      if (url.endsWith('/conversations/1')) {
        return Promise.resolve({
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
          ],
        })
      }

      if (init?.method === 'POST') {
        return Promise.resolve({ ok: false, status: 503 } as Response)
      }

      return Promise.resolve({ ok: true, json: async () => [] })
    }) as typeof fetch

    render(<Home />)
    fireEvent.click(await screen.findByRole('button', { name: /Jeremie/ }))

    const input = await screen.findByLabelText(MESSAGING_TEXT.messages.composerLabel)
    await waitFor(() => expect(input).toBeEnabled())
    fireEvent.change(input, { target: { value: 'Message à conserver' } })
    fireEvent.submit(input.closest('form') as HTMLFormElement)

    expect(await screen.findByRole('alert')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Message à conserver')).toBeInTheDocument()
  })

  it('submits with Enter', async () => {
    const postRequest = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 3 }),
    })
    global.fetch = jest.fn().mockImplementation((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)

      if (url.endsWith('/conversations/1')) {
        return Promise.resolve({
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
          ],
        })
      }

      if (init?.method === 'POST') {
        postRequest(init)
        return postRequest.mock.results[postRequest.mock.results.length - 1]?.value
      }

      return Promise.resolve({ ok: true, json: async () => [] })
    }) as typeof fetch

    render(<Home />)
    fireEvent.click(await screen.findByRole('button', { name: /Jeremie/ }))
    const input = await screen.findByLabelText(MESSAGING_TEXT.messages.composerLabel)
    await waitFor(() => expect(input).toBeEnabled())
    fireEvent.change(input, { target: { value: 'Bonjour' } })
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })

    await waitFor(() => expect(postRequest).toHaveBeenCalledTimes(1))
    await waitFor(() => expect(screen.queryByDisplayValue('Bonjour')).not.toBeInTheDocument())
  })

  it('does not submit a whitespace-only message', async () => {
    const fetchMock = jest.fn().mockImplementation((input: RequestInfo | URL) => {
      if (String(input).endsWith('/conversations/1')) {
        return Promise.resolve({
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
          ],
        })
      }

      return Promise.resolve({ ok: true, json: async () => [] })
    })
    global.fetch = fetchMock as typeof fetch

    render(<Home />)
    fireEvent.click(await screen.findByRole('button', { name: /Jeremie/ }))
    const input = await screen.findByLabelText(MESSAGING_TEXT.messages.composerLabel)
    await waitFor(() => expect(input).toBeEnabled())
    fireEvent.change(input, { target: { value: '   ' } })

    expect(screen.getByRole('button', { name: MESSAGING_TEXT.messages.send })).toBeDisabled()
    fireEvent.submit(input.closest('form') as HTMLFormElement)

    expect(fetchMock).not.toHaveBeenCalledWith(
      'http://localhost:3005/messages/1',
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('sends only one request for a double submission', async () => {
    let resolveSend: ((response: Response) => void) | undefined
    const fetchMock = jest.fn().mockImplementation((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)

      if (url.endsWith('/conversations/1')) {
        return Promise.resolve({
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
          ],
        })
      }

      if (init?.method === 'POST') {
        return new Promise<Response>((resolve) => {
          resolveSend = resolve
        })
      }

      return Promise.resolve({ ok: true, json: async () => [] })
    })
    global.fetch = fetchMock as typeof fetch

    render(<Home />)
    fireEvent.click(await screen.findByRole('button', { name: /Jeremie/ }))
    const input = await screen.findByLabelText(MESSAGING_TEXT.messages.composerLabel)
    await waitFor(() => expect(input).toBeEnabled())
    fireEvent.change(input, { target: { value: 'Bonjour' } })
    const form = input.closest('form') as HTMLFormElement

    fireEvent.submit(form)
    fireEvent.submit(form)

    expect(fetchMock).toHaveBeenCalledTimes(3)
    expect(fetchMock.mock.calls.filter(([, init]) => init?.method === 'POST')).toHaveLength(1)

    await act(async () => {
      resolveSend?.({ ok: true, json: async () => ({ id: 3 }) } as Response)
    })
  })

  it('retries a failed conversation load successfully', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 503 })
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
    global.fetch = fetchMock as typeof fetch

    render(<Home />)

    expect(await screen.findByText(MESSAGING_TEXT.errors.serviceUnavailable))
      .toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: MESSAGING_TEXT.common.retry }))

    await waitFor(() => expect(screen.getByText(MESSAGING_TEXT.conversations.emptyTitle)).toBeInTheDocument())
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('returns to the conversation list from the selected mobile view', async () => {
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
      ],
    }) as typeof fetch

    render(<Home />)
    fireEvent.click(await screen.findByRole('button', { name: /Jeremie/ }))

    fireEvent.click(await screen.findByRole('button', { name: MESSAGING_TEXT.conversations.back }))

    expect(screen.getByText(MESSAGING_TEXT.conversations.title)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: MESSAGING_TEXT.conversations.back })).not.toBeInTheDocument()
  })

  it('creates and selects a new conversation', async () => {
    let conversationRefreshCount = 0
    const fetchMock = jest.fn().mockImplementation((input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)

      if (url.endsWith('/conversations/1') && init?.method === 'POST') {
        return Promise.resolve({ ok: true, json: async () => ({ id: 12 }) })
      }

      if (url.endsWith('/conversations/1')) {
        conversationRefreshCount += 1
        return Promise.resolve({
          ok: true,
          json: async () =>
            conversationRefreshCount > 1
              ? [
                  {
                    id: 12,
                    senderId: 1,
                    senderNickname: 'Thibaut',
                    recipientId: 2,
                    recipientNickname: 'Jeremie',
                    lastMessageTimestamp: 10,
                  },
                ]
              : [],
        })
      }

      if (url.endsWith('/users')) {
        return Promise.resolve({
          ok: true,
          json: async () => [
            { id: 1, nickname: 'Thibaut' },
            { id: 2, nickname: 'Jeremie' },
          ],
        })
      }

      return Promise.resolve({ ok: true, json: async () => [] })
    })
    global.fetch = fetchMock as typeof fetch

    render(<Home />)
    fireEvent.click(screen.getByRole('button', { name: MESSAGING_TEXT.header.newConversation }))

    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    fireEvent.change(await screen.findByLabelText(MESSAGING_TEXT.newConversation.recipientLabel), {
      target: { value: '2' },
    })
    fireEvent.click(screen.getByRole('button', { name: MESSAGING_TEXT.common.create }))

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3005/conversations/1', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipientId: 2 }),
    })
    expect(await screen.findByRole('heading', { name: 'Jeremie' })).toBeInTheDocument()
  })
})
