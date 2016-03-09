export default function HttpError(message, response) {
  this.message = message || this.toString();
  this.stack = (new Error()).stack;
  this.response = response;
}
HttpError.prototype = Object.create(Error.prototype);
