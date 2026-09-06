function sendPublicUsers(res, database) {
  const users = (database.users ?? []).map(({ id, nickname }) => ({
    id,
    nickname,
  }))

  res.status(200).json(users)
}

module.exports = { sendPublicUsers }