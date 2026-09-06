const fs = require('fs')
const path = require('path')

function readDatabase() {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '../db.json'), 'utf8'))
}

function updateConversationTimestamp(conversationId, timestamp) {
  const databasePath = path.join(__dirname, '../db.json')
  const database = readDatabase()
  const conversation = database.conversations?.find(
    (item) => item.id === conversationId,
  )

  if (!conversation) {
    return false
  }

  conversation.lastMessageTimestamp = timestamp
  fs.writeFileSync(databasePath, `${JSON.stringify(database, null, 2)}\n`)
  return true
}

module.exports = { readDatabase, updateConversationTimestamp }
