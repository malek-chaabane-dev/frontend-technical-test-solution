import { render, screen } from '@testing-library/react'
import Home from '../pages'

describe('Home messaging shell', () => {
  it('renders the conversations list and conversation panel', () => {
    render(<Home />)

    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Messages' })).toBeInTheDocument()
    expect(
      screen.getByRole('navigation', { name: 'Conversations' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Conversation' })).toBeInTheDocument()
    expect(screen.getByText('Aucune conversation')).toBeInTheDocument()
    expect(
      screen.getByText('Aucune conversation sélectionnée'),
    ).toBeInTheDocument()
    expect(screen.queryByText(/Welcome/)).not.toBeInTheDocument()
  })
})
