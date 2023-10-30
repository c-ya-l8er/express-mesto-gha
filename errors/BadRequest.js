class BAD_REQUEST extends Error {
  constructor(message) {
    super(message);
    this.name = '400_BAD_REQUEST';
    this.statusCode = 400;
  }
}
module.exports = BAD_REQUEST;
