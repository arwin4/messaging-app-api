const passport = require('passport');

function verifyAuthorization(req, res, next) {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err) return next(err);
    if (!user)
      return res.status(401).send({ errors: [{ title: 'Unauthorized' }] });
    req.user = user;
    return next();
  })(req, res, next);
}

module.exports = verifyAuthorization;
