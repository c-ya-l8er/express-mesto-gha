class FORBIDDEN extends Error {
  constructor(message) {
    super(message);
    this.name = '403_FORBIDDEN';
    this.statusCode = 403;
  }
}
module.exports = FORBIDDEN;
