/* eslint-disable no-console */
const createError = require('http-errors');
const cors = require('cors');
const express = require('express');
const path = require('path');
const logger = require('morgan');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const session = require('express-session');
const passport = require('passport');

const app = express();

const User = require('./models/user');

// Import secrets
require('dotenv').config();

// CORS
const corsOptions = {
  origin: process.env.CORS_ORIGIN,
  maxAge: 7200,
};
app.use(cors(corsOptions));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

const sessionSecret = process.env.SESSION_SECRET;
app.use(
  session({ secret: sessionSecret, resave: false, saveUninitialized: true }),
);
app.use(passport.initialize());
app.use(passport.session());

const jwtStrategy = require('./passport/strategies/jwt');

passport.use(jwtStrategy);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Routes
const userRouter = require('./routes/user');
const authRouter = require('./routes/auth');
const roomRouter = require('./routes/room');
const friendRouter = require('./routes/friend');
// const connectToMongoAtlas = require('./mongoConfig');
// const initializeMongoServer = require('./tests/mongoConfigTesting');

app.use('/users/', userRouter);
app.use('/auth/', authRouter);
app.use('/rooms/', roomRouter);
app.use('/friends/', friendRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// let mongoConnectionSuccessful = false;

// async function connectToMongoAtlas() {
//   console.log('Connecting to MongoDB Atlas...');
//   try {
//     await mongoose.connect(process.env.MONGODB_CONNECTION_STRING);
//     mongoConnectionSuccessful = true;
//   } catch (error) {
//     console.log(error);
//   }
// }

// connectToMongoAtlas()
//   .then(() => {
//     // eslint-disable-next-line no-unused-expressions
//     mongoConnectionSuccessful
//       ? console.log('Connection to MongoDB Atlas successful.')
//       : console.log('Connection to MongoDB Atlas FAILED.');
//     console.log('Server has finished starting.');
//   })
//   .catch((err) => console.log(err));

// async function initializeMongoServer() {
//   const mongoServer = await MongoMemoryServer.create();
//   const mongoUri = mongoServer.getUri();

//   mongoose.connect(mongoUri);

//   mongoose.connection.on('error', (e) => {
//     if (e.message.code === 'ETIMEDOUT') {
//       console.log(e);
//       mongoose.connect(mongoUri);
//     }
//     console.log(e);
//   });
// }

// initializeMongoServer();

module.exports = app;
