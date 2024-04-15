const request = require('supertest');
const express = require('express');
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
