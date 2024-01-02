const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

exports.login = asyncHandler(async (req, res, next) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user)
    return res.status(404).send({ errors: [{ title: 'User not found.' }] });

  const match = await bcrypt.compare(password, user.password);
  if (!match)
    return res.status(401).send({ errors: [{ title: 'Wrong password.' }] });

  // Create and send token
  try {
    const secret = process.env.JWT_SECRET_KEY;

    const token = jwt.sign({ username }, secret, { expiresIn: '1d' });
    return res.status(200).json(token);
  } catch (error) {
    return next(error);
  }
});
