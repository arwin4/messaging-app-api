function handleBadRoomRequest(res) {
  return res.status(400).send({
    errors: [
      { title: 'The room does not exist or you are not a member of it' },
    ],
  });
}

module.exports = handleBadRoomRequest;
