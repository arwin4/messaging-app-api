const messageSchema = {
  isText: {
    isBoolean: true,
  },
  isImage: {
    isBoolean: true,
  },
  textContent: {
    optional: true,
    trim: true,
    isLength: {
      options: { min: 1, max: 500 },
      errorMessage: 'Message must be 1-500 characters long',
    },
  },
  // imageUrl: {
  //   optional: true,
  //   isURL: true,
  // },
};

module.exports = messageSchema;
