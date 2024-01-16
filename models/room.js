const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  dateCreated: {
    type: Date,
    required: true,
  },
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  isGroup: {
    type: Boolean,
    required: false,
  },
  messages: [
    new mongoose.Schema({
      dateCreated: {
        type: Date,
        required: true,
      },
      author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      content: {
        isText: {
          type: Boolean,
          required: true,
        },
        isImage: {
          type: Boolean,
          required: true,
        },
        textContent: {
          type: String,
        },
        imageUrl: {
          type: String,
        },
      },
    }),
  ],
});

module.exports = mongoose.model('Room', RoomSchema);
