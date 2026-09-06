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
})
