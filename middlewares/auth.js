const jwt = require('jsonwebtoken');
const UNAUTHORIZED = require('../errors/Unauthorized');

const handleAuthError = (res, next) => {
  next(new UNAUTHORIZED('Необходима авторизация'));
};

const extractBearerToken = (header) => header.replace('Bearer ', '');

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return handleAuthError(res, next);
  }

  const token = extractBearerToken(authorization);
  let payload;

  try {
    payload = jwt.verify(token, 'super-puper-secret');
  } catch (error) {
    return handleAuthError(res, next);
  }

  req.user = payload;

  return next();
};
