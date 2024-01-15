const asyncHandler = require('express-async-handler');
const findUser = require('../utils/findUser');

exports.addFriend = asyncHandler(async (req, res) => {
  // TODO: add try..catch
  const { newFriend } = req.body;

  const newFriendExists = await findUser(newFriend);
  if (!newFriendExists) {
    return res
      .status(404)
      .send({ errors: [{ title: 'This user does not exist.' }] });
  }

  const currentUser = await findUser(req.user.username);
  const { friends } = currentUser;

  if (currentUser.username === newFriend) {
    return res
      .status(400)
      .send({ errors: [{ title: 'You cannot add yourself as a friend.' }] });
  }

  if (friends.includes(newFriend)) {
    return res
      .status(400)
      .send({ errors: [{ title: 'This user is already your friend.' }] });
  }

  currentUser.friends.push(newFriend);
  await currentUser.save();

  return res.send({ friends: currentUser.friends });
});

exports.deleteFriends = asyncHandler(async (req, res) => {
  const { friendsToDelete } = req.body;

  try {
    const currentUser = await findUser(req.user.username);
    const oldFriends = currentUser.friends;

    const newFriends = oldFriends.filter(
      (friend) => !friendsToDelete.includes(friend),
    );

    currentUser.friends = newFriends;
    await currentUser.save();

    return res.send({ friends: newFriends });
  } catch (error) {
    return res.status(500).send({ errors: [{ title: 'Database error' }] });
  }
});
