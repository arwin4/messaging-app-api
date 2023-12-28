const asyncHandler = require('express-async-handler');
const findUser = require('../utils/findUser');

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
