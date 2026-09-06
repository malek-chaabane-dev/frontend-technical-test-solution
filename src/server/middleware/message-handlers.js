const { LOGGED_USER_ID } = require('../constants')

function enrichCreatedMessage(req) {
  const conversationId = Number(req.query?.conversationId)

  if (!Number.isInteger(conversationId) || !req.body) {
    return
  }

  req.body = {
    ...req.body,
    conversationId,
    authorId: LOGGED_USER_ID,
  }
}

module.exports = { enrichCreatedMessage }
