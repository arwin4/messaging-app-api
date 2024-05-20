# Messaging app API

This is a backend implementation of [The Odin Project's full stack _Messaging App_ project](https://www.theodinproject.com/lessons/nodejs-messaging-app). It is an Express app using MongoDB that manages user creation and authentication, chats, and friends.

As the penultimate project in The Odin Project's curriculum, it showcases a ton of what I've learned during the course. Some of the highlights are listed below.

You might like to check out [the frontend](https://github.com/arwin4/messaging-app) as well.

## Some notable features

- A socket.io server running alongside the API to send live chat updates to clients
- Group chats
- Local user creation and authorization using PassportJS
- Postman tests for all API endpoints
- A bot user that counts messages
- Validation using express-validator

## ~~Known issues~~

- ~~mongo.watch() in socket.js detaches automatically after a period of time,
  causing all socket event emissions to fail. The suspicion is that a 'close'
  event occurs mongo.watch(), after which the connection is not reestablished.
  It is unknown what causes this. This issue has occurred within hours of
  deployment but it may also take several days for it to happen.~~
