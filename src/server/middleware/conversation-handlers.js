function enrichCreatedConversation(req, res, database) {
  const senderId = Number(req.query?.senderId)
  const recipientId = Number(req.body?.recipientId)
  const sender = database.users?.find((user) => user.id === senderId)
  const recipient = database.users?.find((user) => user.id === recipientId)

  if (!sender || !recipient) {
    res.status(400).json({ error: 'Invalid conversation recipient' })
    return false
  }

  req.body = {
    ...req.body,
    senderId: sender.id,
    senderNickname: sender.nickname,
    recipientId: recipient.id,
    recipientNickname: recipient.nickname,
    lastMessageTimestamp: Math.floor(Date.now() / 1000),
  }

  return true
}

function sendUserConversations(req, res, database) {
  const userId = Number(req.query?.senderId)
  const conversations = (database.conversations ?? []).filter(
    (conversation) =>
      conversation.senderId === userId || conversation.recipientId === userId,
  )

  res.status(200).json(conversations)
}

module.exports = { enrichCreatedConversation, sendUserConversations }
