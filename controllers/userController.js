const { checkSchema } = require('express-validator');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const findUser = require('../utils/findUser');
const respondOnValidationError = require('../utils/respondOnValidationError');
const userSchema = require('../express-validator-schemas/user');

exports.signUp = [
  checkSchema(userSchema),

  asyncHandler(async (req, res, next) => {
    const foundUser = await findUser(req.body.username);
    if (foundUser)
      return res
        .status(409)
        .send({ errors: [{ title: 'Username is already taken.' }] });
    return next();
  }),

  asyncHandler(async (req, res, next) => {
    respondOnValidationError(req, res, next);
  }),

  asyncHandler(async (req, res, next) => {
    const user = new User({
      username: req.body.username,
      friends: [],
      dateCreated: Date.now(),
      isBot: false,
    });

    // Encrypt password
    try {
      bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
        user.password = hashedPassword;
        await user.save();
      });
    } catch (error) {
      return next(error);
    }
    return res.send('User created.');
  }),
];

exports.getUser = asyncHandler(async (req, res) => {
  try {
    const foundUser = await findUser(req.params.username);
    if (!foundUser) {
      return res
        .status(404)
        .send({ errors: [{ title: 'User does not exist' }] });
    }
    const user = {
      _id: foundUser._id,
      username: foundUser.username,
      dateCreated: foundUser.dateCreated,
      friends: foundUser.friends,
      isBot: foundUser.isBot,
    };
    return res.send(user);
  } catch (error) {
    return res
      .status(500)
      .send({ errors: [{ title: 'Internal server error' }] });
  }
});

// Get the user info from passport
exports.getCurrentUser = asyncHandler(async (req, res) => {
  const { _id, username, dateCreated, friends } = req.user;

  return res.send({
    user: { _id, username, dateCreated, friends },
  });
});
