const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

async function initializeMongoServer() {
  const mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  // Clean up lingering connection from potential previous tests
  await mongoose.disconnect();

  await mongoose.connect(mongoUri);

  mongoose.connection.on('error', (e) => {
    if (e.message.code === 'ETIMEDOUT') {
      console.log(e);
      mongoose.connect(mongoUri);
    }
    console.log(e);
  });

  // Set up documents for testing
  const { collections } = mongoose.connection;
  const mockUser = {
    _id: 'user-id',
    username: 'testUser',
    dateCreated: '2024-02-27T14:33:48.814Z',
    friends: [
      {
        _id: '65a3ca1d625894cbba68610e',
        username: 'the count',
        isBot: true,
      },
      {
        _id: '65956bdc30e566e7c6152261',
        username: 'Koji',
        isBot: false,
      },
    ],
    isBot: false,
  };

  await collections.users.insertOne(mockUser);

  /**
   * Uncomment these lines for use in debugging the mongodb connection
   */
  // eslint-disable-next-line no-unused-vars
  // const promise = new Promise((resolve) => {
  //   mongoose.connection.once('open', async () => {
  //     console.log(`MongoDB successfully connected to ${mongoUri}`);
  //   });
  //   resolve();
  // });

  return mongoServer;
}

module.exports = initializeMongoServer;
