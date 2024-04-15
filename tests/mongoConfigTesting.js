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
