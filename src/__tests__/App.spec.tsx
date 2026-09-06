import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import Home from '../pages'

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
    expect(screen.getByRole('heading', { name: 'Messages' })).toBeInTheDocument()
    expect(
      screen.getByRole('navigation', { name: 'Conversations' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Conversation' })).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent(
      'Chargement des conversations...',
    )

    return waitFor(() => {
      expect(screen.getByText('Aucune conversation')).toBeInTheDocument()
      expect(
        screen.getByText('Aucune conversation sélectionnée'),
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
    expect(screen.getByRole('article', { name: 'Message envoyé' })).toBeInTheDocument()
    expect(screen.getByRole('article', { name: 'Message reçu' })).toBeInTheDocument()
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

    const input = await screen.findByLabelText('Votre message')
    await waitFor(() => expect(input).toBeEnabled())
    fireEvent.change(input, { target: { value: 'Bonjour' } })
    fireEvent.submit(input.closest('form') as HTMLFormElement)

    expect(screen.getByRole('button', { name: 'Envoi...' })).toBeDisabled()
    expect(screen.getByDisplayValue('Bonjour')).toBeInTheDocument()

    resolveSend?.({ ok: true, json: async () => ({ id: 3 }) } as Response)
    await waitFor(() => expect(screen.queryByDisplayValue('Bonjour')).not.toBeInTheDocument())
    expect(screen.getByRole('button', { name: 'Envoyer' })).toBeDisabled()
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

    const input = await screen.findByLabelText('Votre message')
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
    const input = await screen.findByLabelText('Votre message')
    await waitFor(() => expect(input).toBeEnabled())
    fireEvent.change(input, { target: { value: 'Bonjour' } })
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' })

    await waitFor(() => expect(postRequest).toHaveBeenCalledTimes(1))
    await waitFor(() => expect(screen.queryByDisplayValue('Bonjour')).not.toBeInTheDocument())
  })
})
