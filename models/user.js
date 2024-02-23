const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
  username: {
    type: String,
    maxLength: [12, 'Username must not exceed 12 characters'],
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
  password: {
    type: String,
  },
});

module.exports = mongoose.model('User', UserSchema);
