const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  dateCreated: {
    type: Date,
    required: true,
  },
  friends: {
    type: Array,
    required: true,
  },
  isBot: {
    type: Boolean,
    required: true,
  },
});

module.exports = mongoose.model('User', UserSchema);
