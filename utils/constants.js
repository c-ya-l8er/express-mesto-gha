const http2 = require('http2');

const HTTP_STATUS = Object.fromEntries(
  Object.entries(http2.constants)
    .filter(([key]) => key.startsWith('HTTP_STATUS_'))
    .map(([key, value]) => [key.replace('HTTP_STATUS_', ''), value]),
);

module.exports = { HTTP_STATUS };
