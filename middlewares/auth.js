const jwt = require('jsonwebtoken');
const UNAUTHORIZED = require('../errors/Unauthorized');

const handleAuthError = (next) => {
  next(new UNAUTHORIZED('Необходима авторизация'));
};

const extractBearerToken = (header) => header.replace('Bearer ', '');

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return handleAuthError(next);
  }

  const token = extractBearerToken(authorization);
  let payload;

  try {
    payload = jwt.verify(token, 'super-puper-secret');
  } catch (error) {
    return handleAuthError(next);
  }

  req.user = payload;

  return next();
};
