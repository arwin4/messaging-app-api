const mongoose = require('mongoose');

const mongoDb = `YOUR MONGO URL`;

mongoose.connect(mongoDb);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'mongo connection error'));
