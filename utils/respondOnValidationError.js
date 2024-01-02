const { validationResult } = require('express-validator');

// If validation fails, send a HTTP 400 Bad request status with error message to client
function respondOnValidationError(req, res, next) {
  const errors = validationResult(req);
  let errorMessages = 'Error: ';

  errors.errors.forEach((message) => {
    errorMessages += `${message.msg}. `;
  });

  if (!errors.isEmpty()) {
    return res.status(400).send(errorMessages);
  }

  return next();
}

module.exports = respondOnValidationError;
