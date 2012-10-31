/*
 * serviceUtils.js: Azure Service Manager utilities.
 *
 * (C) Microsoft Open Technologies, Inc.
 *
 */

var azure = require('azure');
var errs = require('errs');

var requestStatus = exports.requestStatus = function (requestId, serviceManager, callback) {
  serviceManager.getOperationStatus(requestId, function(err, result) {
    if (err) {
      callback(err);
    } else {
      callback(null, result);
    }
  });
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