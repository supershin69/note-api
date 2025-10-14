const inputValidator = (username, password, res) => {
  if (!username || !password) {
    return res.status(400).json({ message: 'You need both fields.'});
  }
}

module.exports = inputValidator;