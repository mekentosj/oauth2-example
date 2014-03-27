var util = require('util');

function NotFound(message) {
  this.code = 404;
  this.message = message;
  Error.call(this);
}

util.inherits(NotFound, Error);

function BadRequest(message) {
  this.code = 400;
  this.message = message;
  Error.call(this);
}

util.inherits(BadRequest, Error);

function ValidationError(message, path) {
  this.code = 400;
  this.message = message;
  this.errors = {};
  this.errors[path] = {
    message: message,
    name: 'ValidatorError',
    path: path,
    type: 'user defined'
  };

  Error.call(this);
}

util.inherits(ValidationError, Error);

module.exports = {
  NotFound: NotFound,
  BadRequest: BadRequest,
  ValidationError: ValidationError
};
