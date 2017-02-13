/*
 * quotes.js: Instance methods for working with quotes from Cloudkitty
 *
 * (C) 2015 Hopebaytech
 *      Julian Liu
 * MIT LICENSE
 *
 *
 */
var urlJoin = require('url-join');

var _urlPrefix = 'v1';

/**
 * client.getQuotes
 *
 * @description Get the quotation for an resource
 *
 * @param {String}            [details.service]    service name to quote
 * @param {Integer}           [details.volume]     volume (quantity)
 * @param {Object}            [details.desc]       detail description
 * @param {Function}          callback
 */
exports.getQuotes = function (details, callback) {
  var quoteOptions = {
    method: 'POST',
    path: urlJoin(_urlPrefix, 'rating/quote'),
    body: {
      // quote only one service
      resources: [{service: details.service, volume: details.volume, desc: details.desc}]
    }
  };

  this._request(quoteOptions, function (err, body) {
    if (err) {
      return callback(err);
    }

    return callback(null, body);
  });
};
