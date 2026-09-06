const {
  readDatabase,
  updateConversationTimestamp,
} = require('./database')
const {
  enrichCreatedConversation,
  sendUserConversations,
} = require('./conversation-handlers')
const { enrichCreatedMessage } = require('./message-handlers')
const { sendPublicUsers } = require('./user-handlers')

function isConversationRequest(req) {
  return req.url.includes('/conversations')
}

function isMessageRequest(req) {
  return req.url.includes('/messages')
}

function isUsersRequest(req) {
  return req.url.includes('/users')
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

  if (isUsersRequest(req) && req.method === 'GET') {
    sendPublicUsers(res, database)
    return
  }

  if (isMessageRequest(req) && req.method === 'POST') {
    enrichCreatedMessage(req)
    const conversationId = Number(req.query?.conversationId)
    const timestamp = Number(req.body?.timestamp)

    res.once('finish', () => {
      if (
        res.statusCode >= 200 &&
        res.statusCode < 300 &&
        Number.isInteger(timestamp) &&
        timestamp >= 0
      ) {
        updateConversationTimestamp(conversationId, timestamp)
      }
    })
  }

  next()
}