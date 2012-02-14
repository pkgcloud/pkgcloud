var EventEmitter = require('events').EventEmitter;

// how to handle errors in the api
// consistently with request
exports.Err = function err(error, callback) {
  if(typeof error === 'string') {
    error = new Error(error);
  }
  if(callback) {
    return callback(error);
  } else {
    var em = new EventEmitter();
    process.nextTick(function() { em.emit('error', error); });
    return em;
  }
};