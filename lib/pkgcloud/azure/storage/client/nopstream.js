/*
 * nopstream.js: A simple stream to have a writestream call back with data events.
 * Used to adapt Azure download blob functions to call back with the data packets.
 * This is a hack to pass the testing which requires a stream.
 *
 * (C) 2012 Nodejitsu Inc.
 *
 */
var Stream = require('stream').Stream;

var NopStream = function () {
  Stream.call(this);
  this.readable = true;
  this.writable = true;
};

exports.NopStream = NopStream;

// Inherit from base stream class.
require('util').inherits(NopStream, Stream);

// Extract args to `write` and emit as `data` event.
NopStream.prototype.write = function (data) {
  this.emit('data',data);
  return true;
};


// Extract args to `end` and emit as `end` event.
NopStream.prototype.end = function () {
  this.emit('end');
};