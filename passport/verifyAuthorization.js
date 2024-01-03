const passport = require('passport');

const jwtStrategy = require('./strategies/jwt');

passport.use(jwtStrategy);

function verifyAuthorization(req, res, next) {
  passport.authenticate('jwt', { session: false }, (err, status) => {
    if (err) return next(err);
    if (!status)
      return res.status(401).send({ errors: [{ title: 'Unauthorized' }] });
    return next();
  })(req, res, next);
}

module.exports = verifyAuthorization;
