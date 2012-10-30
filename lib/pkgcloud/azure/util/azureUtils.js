var azure = require('azure');
var errs = require('errs');
var URL = require('url');

var getContainerFromUri = exports.getContainerFromUrl = function (uri, callback) {
  var u,
    tokens;

  if(!uri) {
    return errs.handle(
      errs.create({
        message: 'uri is a required argument.'
      }),
      callback
    );
  }

  var u = URL.parse(uri);
  if(!u.path) {
    return errs.handle(
      errs.create({
        message: 'invalid uri'
      }),
      callback
    );
  }

  var tokens =
};

var pollRequestStatus = exports.pollRequestStatus = function (requestId, interval, serviceManager, callback) {

  var checkStatus = function () {
    requestStatus(requestId, serviceManager, function(err, result) {
      if (err) {
        callback(err);
      } else {
        switch (result.body.Status) {
          case 'InProgress':
            setTimeout(checkStatus, interval);
            break;

          case 'Failed':
            callback(result.body.Error);
            break;

          case 'Succeeded':
            callback(null);
            break;
        }
      }
    });
  };

  checkStatus();
};