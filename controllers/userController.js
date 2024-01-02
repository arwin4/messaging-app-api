const { checkSchema } = require('express-validator');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const findUser = require('../utils/findUser');
const respondOnValidationError = require('../utils/respondOnValidationError');
const userSchema = require('../express-validator-schemas/user');

exports.signUp = [
  // TODO: conform to error format used in GET
  checkSchema(userSchema),

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
    const user = {
      username: foundUser.username,
      dateCreated: foundUser.dateCreated,
      friends: foundUser.friends,
      isBot: foundUser.isBot,
    };
    return res.send(user);
  } catch (error) {
    if (error.message === '404') {
      return res
        .status(404)
        .send({ errors: [{ title: 'User does not exist' }] });
    }
    return res
      .status(500)
      .send({ errors: [{ title: 'Internal server error' }] });
  }
});
