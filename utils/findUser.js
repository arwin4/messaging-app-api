const User = require('../models/user');

async function findUser(username) {
  const currentUser = await User.findOne({ username }).exec();

  if (!currentUser) return false;
  return currentUser;
}

module.exports = findUser;
