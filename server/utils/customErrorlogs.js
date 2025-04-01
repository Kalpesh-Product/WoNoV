class CustomError extends Error {
  constructor(
    message,
    path = "",
    action = "",
    sourceKey = "",
    statusCode = 400
  ) {
    super(message);
    this.statusCode = statusCode;
    this.path = path;
    this.action = action;
    this.sourceKey = sourceKey;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = CustomError;
