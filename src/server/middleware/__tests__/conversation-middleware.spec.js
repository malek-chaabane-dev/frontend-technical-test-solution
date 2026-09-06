const {
  enrichCreatedConversation,
  sendUserConversations,
} = require('../conversation-handlers')
const { enrichCreatedMessage } = require('../message-handlers')

const database = {
  users: [
    { id: 1, nickname: 'Thibaut' },
    { id: 2, nickname: 'Jeremie' },
  ],
  conversations: [
    { id: 1, senderId: 1, recipientId: 2 },
    { id: 2, senderId: 3, recipientId: 4 },
  ],
}

describe('conversation middleware helpers', () => {
  it('enriches a valid conversation request', () => {
    const request = {
      query: { senderId: '1' },
      body: { recipientId: 2 },
    }
    const response = { status: jest.fn().mockReturnThis(), json: jest.fn() }

    expect(enrichCreatedConversation(request, response, database)).toBe(true)
    expect(request.body).toEqual(
      expect.objectContaining({
        senderId: 1,
        senderNickname: 'Thibaut',
        recipientId: 2,
        recipientNickname: 'Jeremie',
      }),
    )
    expect(response.status).not.toHaveBeenCalled()
  })

  it('rejects an unknown conversation recipient', () => {
    const request = {
      query: { senderId: '1' },
      body: { recipientId: 99 },
    }
    const response = { status: jest.fn().mockReturnThis(), json: jest.fn() }

    expect(enrichCreatedConversation(request, response, database)).toBe(false)
    expect(response.status).toHaveBeenCalledWith(400)
  })

  it('filters conversations for the requested user', () => {
    const response = { status: jest.fn().mockReturnThis(), json: jest.fn() }

    sendUserConversations({ query: { senderId: '1' } }, response, database)

    expect(response.json).toHaveBeenCalledWith([database.conversations[0]])
  })

  it('enriches a message with its conversation and author', () => {
    const request = {
      query: { conversationId: '7' },
      body: { body: 'Hello' },
    }

    enrichCreatedMessage(request)

    expect(request.body).toEqual({ body: 'Hello', conversationId: 7, authorId: 1 })
  })
})
