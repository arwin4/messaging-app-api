const User = require('../models/user');

async function findUser(username) {
  const currentUser = await User.findOne({ username }).exec();

  if (!currentUser) throw new Error(404);
  return currentUser;
}

module.exports = findUser;
