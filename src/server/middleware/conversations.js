const { readDatabase } = require('./database')
const {
  enrichCreatedConversation,
  sendUserConversations,
} = require('./conversation-handlers')
const { enrichCreatedMessage } = require('./message-handlers')

function isConversationRequest(req) {
  return req.url.includes('/conversations')
}

function isMessageRequest(req) {
  return req.url.includes('/messages')
}

module.exports = (req, res, next) => {
  const database = readDatabase()

  if (isConversationRequest(req) && req.method === 'POST') {
    if (!enrichCreatedConversation(req, res, database)) {
      return
    }

    next()
    return
  }

  if (isConversationRequest(req) && req.method === 'GET') {
    sendUserConversations(req, res, database)
    return
  }

  if (isMessageRequest(req) && req.method === 'POST') {
    enrichCreatedMessage(req)
  }

  next()
}