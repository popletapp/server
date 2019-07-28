class HTTPError extends Error {
  constructor (message, code) {
    super(message);
    this.code = code;
    this.name = 'HTTPError';
  }
}

export default HTTPError;