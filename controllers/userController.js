const asyncHandler = require('express-async-handler');
const findUser = require('../utils/findUser');

exports.getUser = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const foundUser = await findUser(username);
  const user = {
    username: foundUser.username,
    dateCreated: foundUser.dateCreated,
    friends: foundUser.friends,
    isBot: foundUser.isBot,
  };
  return res.send(user);
});
