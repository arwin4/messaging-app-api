const { validationResult } = require('express-validator');

// If validation fails, send a HTTP 400 Bad request status with error message to client
function respondOnValidationError(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = [];
    errors.errors.forEach((message) => {
      formattedErrors.push({ title: message.msg });
    });

    return res.status(400).send({ errors: formattedErrors });
  }

  return next();
}

module.exports = respondOnValidationError;
