const fs = require('fs')
const path = require('path')

function readDatabase() {
  return JSON.parse(fs.readFileSync(path.join(__dirname, '../db.json'), 'utf8'))
}

module.exports = { readDatabase }
