const jwt = require('jsonwebtoken')
const JWT_TOKEN = process.env.JWT_KEY;
const REFRESH_TOKEN = process.env.REFRESH_KEY;

const accessTokenGenerator = (user) => {
  return jwt.sign({ id: user._id, username: user.username, role: user.role }, JWT_TOKEN, {expiresIn: '1h'});
}

const refreshTokenGenerator = (user) => {
  return jwt.sign({ id: user._id, username: user.username, role: user.role }, REFRESH_TOKEN);
}

module.exports = {
  accessTokenGenerator,
  refreshTokenGenerator
}