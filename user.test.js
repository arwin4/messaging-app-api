const request = require('supertest');
const express = require('express');
const app = require('./app');

app.use(express.urlencoded({ extended: false }));

const userRouter = require('./routes/user');
const authRouter = require('./routes/auth');
const roomRouter = require('./routes/room');
const friendRouter = require('./routes/friend');

app.use('/users/', userRouter);
app.use('/auth/', authRouter);
app.use('/rooms/', roomRouter);
app.use('/friends/', friendRouter);

test.skip('index route works', (done) => {
  request(app)
    .get('/')
    .expect('Content-Type', /json/)
    // .expect({ name: 'frodo' })
    .expect(200, done);
});

// test('testing route works', (done) => {
//   request(app)
//     .post('/test')
//     .type('form')
//     .send({ item: 'hey' })
//     .then(() => {
//       request(app)
//         .get('/test')
//         .expect({ array: ['hey'] }, done);
//     });
// });
