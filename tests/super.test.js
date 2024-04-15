const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const user = require('../routes/user');
const initializeMongoServer = require('./mongoConfigTesting');

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use('/', user);

// Skip authorization middleware for unit tests
jest.mock('../passport/verifyAuthorization', () =>
  jest.fn((req, res, next) => next()),
);

beforeEach(async () => {
  await initializeMongoServer();

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
});

test('test route works', (done) => {
  request(app)
    .get('/test')
    .expect('Content-Type', /json/)
    .expect({ name: 'testUser' })
    .expect(200, done);
});

test('get user route works', async () => {
  const res = await request(app).get('/testUser');

  expect(res.statusCode).toBe(200);
  expect(res.body.username).toBe('testUser');
});

test.skip('signup works', (done) => {
  request(app)
    .post('/')
    .set('Content-Type', 'application/json')
    .send({ username: 'hello', password: 'abc' })
    // .expect('Content-Type', /json/)
    // .expect({
    //   errors: [
    //     {
    //       title: 'Unauthorized',
    //     },
    //   ],
    // })
    .expect(401, done);
});
