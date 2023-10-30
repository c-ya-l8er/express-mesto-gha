class UNAUTHORIZED extends Error {
  constructor(message) {
    super(message);
    this.name = '401_UNAUTHORIZED';
    this.statusCode = 401;
  }
}
module.exports = UNAUTHORIZED;
