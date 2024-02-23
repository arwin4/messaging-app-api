const userSchema = {
  username: {
    trim: true,
    escape: true,
    isLength: {
      options: { max: 12 },
      errorMessage: 'Username may be no longer than 12 characters',
    },
  },
  password: {
    trim: true,
    isLength: {
      options: { min: 3, max: 100 },
      errorMessage: 'Password must be between 3 and 100 characters long',
    },
  },
};

module.exports = userSchema;
