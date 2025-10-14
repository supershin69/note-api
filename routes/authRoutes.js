const jwt = require('jsonwebtoken');
const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const { accessTokenGenerator, refreshTokenGenerator } = require('../utils/tokenGenerator');
const inputValidator = require('../utils/inputValidator');

const router = express.Router();
const REFRESH_TOKEN = process.env.REFRESH_KEY;

router.post('/signup', async (req, res) => {
  const { username, password} = req.body;
  inputValidator(username, password, res);
  try {
    const exists = await User.findOne({ username });
    if (exists) {
      return res.status(401).json({message: 'User already exists'});
    }
    
    const user = await User.create({ username, password });

    const accessToken = accessTokenGenerator(user);
    const refreshToken = refreshTokenGenerator(user);

    user.accessToken = accessToken;
    user.refreshToken = refreshToken;

    await user.save();

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 1000
    });

    return res.status(201).json({ message: 'Successfully signed in', accessToken: accessToken, refreshToken: refreshToken});

  } catch (err) {
    return res.status(500).json({ error: 'Unexpected error occured'});
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  inputValidator(username, password, res);
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found'});
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Wrong password'});
    }

    const accessToken = accessTokenGenerator(user);
    const refreshToken = refreshTokenGenerator(user);

    user.accessToken = accessToken;
    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 1000
    });

    return res.status(200).json({ message: 'User successfully logged in', accessToken: accessToken, refreshToken: refreshToken});

  } catch(err) {
    return res.status(500).json({ error: 'Unexpected error occured'});
  }
});

router.post('/logout', async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.sendStatus(204);

    const user = await User.findOne({ refreshToken: token});
    if (!user) return res.sendStatus(204);

    user.accessToken = null;
    user.refreshToken = null;
    await user.save();

    return res.status(200).json({ message: 'User successfully logged out'});

  } catch(err) {
    return res.status(500).json({ error: 'Unexpected error occured'});
  }
});

router.post('/refresh', async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: 'Not token provided'});

  try {
    const decoded = jwt.verify(token, REFRESH_TOKEN);
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== token) {
      return res.status(403).json({ message: 'Invalid token'});
    }

    const newAccessToken = accessTokenGenerator(user);
    const newRefreshToken = refreshTokenGenerator(user);

    user.accessToken = newAccessToken;
    user.refreshToken = newRefreshToken;
    await user.save();

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 1000
    });

    return res.status(201).json({message: 'New token generated', accessToken: newAccessToken, refreshToken: newRefreshToken});

  } catch(err) {
    return res.status(500).json({ error: 'Unexpected error occured'});
  }
})

module.exports = router;