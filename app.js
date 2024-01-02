/* eslint-disable no-console */
const createError = require('http-errors');
const cors = require('cors');
const express = require('express');
const path = require('path');
const logger = require('morgan');
const mongoose = require('mongoose');

const app = express();

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

// Routes
const userRouter = require('./routes/user');
const authRouter = require('./routes/auth');

app.use('/users/', userRouter);
app.use('/auth/', authRouter);

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

module.exports = app;
