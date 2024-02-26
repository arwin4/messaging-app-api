const asyncHandler = require('express-async-handler');
const findUser = require('../utils/findUser');

exports.addFriend = asyncHandler(async (req, res) => {
  const { newFriend: newFriendUsername } = req.body;

  try {
    const newFriend = await findUser(newFriendUsername);
    if (!newFriend) {
      return res
        .status(404)
        .send({ errors: [{ title: 'This user does not exist.' }] });
    }

    const currentUser = await findUser(req.user.username);
    const { friends } = currentUser;

    if (currentUser.username === newFriendUsername) {
      return res
        .status(400)
        .send({ errors: [{ title: 'You cannot add yourself as a friend.' }] });
    }

    const filteredNewFriend = {
      _id: newFriend._id,
      username: newFriend.username,
      isBot: newFriend.isBot,
    };

    if (
      friends.some((friend) => friend.username === filteredNewFriend.username)
    ) {
      return res
        .status(400)
        .send({ errors: [{ title: 'This user is already your friend.' }] });
    }

    currentUser.friends.push(filteredNewFriend);
    await currentUser.save();

    return res.send({ friends: currentUser.friends });
  } catch (error) {
    return res.status(500).send({ errors: [{ title: 'Database error' }] });
  }
});

exports.deleteFriends = asyncHandler(async (req, res) => {
  const { friendsToDelete } = req.body;

  try {
    const currentUser = await findUser(req.user.username);
    const oldFriends = currentUser.friends;

    const newFriends = oldFriends.filter(
      (friend) => !friendsToDelete.includes(friend.username),
    );

    currentUser.friends = newFriends;
    await currentUser.save();

    return res.send({ friends: newFriends });
  } catch (error) {
    return res.status(500).send({ errors: [{ title: 'Database error' }] });
  }
});
