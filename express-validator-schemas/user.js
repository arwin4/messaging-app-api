const userSchema = {
  username: {
    trim: true,
    escape: true,
    isLength: {
      options: { max: 100 },
      errorMessage: 'Username may be no longer than 100 characters',
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
