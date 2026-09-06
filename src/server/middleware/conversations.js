const fs = require('fs')
const path = require('path')

function readDatabase() {
  return JSON.parse(
    fs.readFileSync(path.join(__dirname, '../db.json'), 'utf8')
  )
}

// Need this middleware to catch some requests
// and return both conversations where userId is sender or recipient
module.exports = (req, res, next) => {
  const db = readDatabase()

  if (/conversations/.test(req.url) && req.method === 'POST') {
    const senderId = Number(req.query?.senderId)
    const recipientId = Number(req.body?.recipientId)
    const sender = db?.users?.find(user => user.id === senderId)
    const recipient = db?.users?.find(user => user.id === recipientId)

    if (!sender || !recipient) {
      res.status(400).json({ error: 'Invalid conversation recipient' })
      return
    }

    req.body.senderId = sender.id
    req.body.senderNickname = sender.nickname
    req.body.recipientId = recipient.id
    req.body.recipientNickname = recipient.nickname
    req.body.lastMessageTimestamp = Math.floor(Date.now() / 1000)
  }

  if (/messages/.test(req.url) && req.method === 'POST') {
    const conversationId = Number(req.query?.conversationId)

    if (Number.isInteger(conversationId) && req.body) {
      req.body.conversationId = conversationId
      req.body.authorId = 1
    }
  }

  if (/conversations/.test(req.url) && req.method === 'GET') {
    const userId = req.query?.senderId
    const result = db?.conversations?.filter(
      conv => conv.senderId == userId || conv.recipientId == userId
    )

    res.status(200).json(result)
    return
  }

  next()
}