const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');
const User = require('../../models/user');

const opts = {};
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.JWT_SECRET_KEY;

module.exports = new JwtStrategy(opts, async (jwtPayload, done) => {
  const { username } = jwtPayload;
  const user = await User.findOne({ username });

  if (username === user.username) return done(null, user);
  return done(null, false);
});
