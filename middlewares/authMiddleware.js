const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const JWT = process.env.JWT_KEY;

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({message: 'No header provided.'});
    } 

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Not token provided'});
    }

    const decoded = jwt.verify(token, JWT);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found'});
    }

    if (user.accessToken !== token) {
      return res.status(403).json({ message: 'Not your token. Forbidden' });
    }

    req.user = user;
    next();
    
  } catch(err) {
    return res.status(401).json({ message: 'Invalid token'});
  }
}

module.exports = authMiddleware;