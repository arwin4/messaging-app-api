const mongoose = require('mongoose');

function connectToMongoAtlas() {
  let mongoConnectionSuccessful = false;

  async function connectToMongoAtlas() {
    console.log('Connecting to MongoDB Atlas...');
    try {
      await mongoose.connect(process.env.MONGODB_CONNECTION_STRING);
      mongoConnectionSuccessful = true;
    } catch (error) {
      console.log(error);
    }
  }

  connectToMongoAtlas()
    .then(() => {
      // eslint-disable-next-line no-unused-expressions
      mongoConnectionSuccessful
        ? console.log('Connection to MongoDB Atlas successful.')
        : console.log('Connection to MongoDB Atlas FAILED.');
      console.log('Server has finished starting.');
    })
    .catch((err) => console.log(err));
}

module.exports = connectToMongoAtlas;
