const jwt = require('jsonwebtoken');
const statusCodes = require('../utils/constants').HTTP_STATUS;
// const UNAUTHORIZED = require('../errors/Unauthorized');

const handleAuthError = (res) => {
  res
    .status(statusCodes.UNAUTHORIZED)
    .send({ message: 'Необходима авторизация' });
};

const extractBearerToken = (header) => header.replace('Bearer ', '');

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return handleAuthError(res);
  }

  const token = extractBearerToken(authorization);
  let payload;

  try {
    payload = jwt.verify(token, 'super-puper-secret');
  } catch (error) {
    return handleAuthError(res);
  }

  req.user = payload;

  return next();
};
