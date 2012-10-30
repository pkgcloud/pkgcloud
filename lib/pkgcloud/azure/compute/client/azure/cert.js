/*
 * cert.js: methods to handle Azure pem certificate
 *
 * pem functions borrowed from azure/utils
 * (C) 2012 Nodejitsu Inc.
 *
 */

var azure = require('azure');
var async = require('async');
var fs = require('fs');
var errs = require('errs');
var crypto = require('crypto');

var BEGIN_CERT = '-----BEGIN CERTIFICATE-----';
var END_CERT   = '-----END CERTIFICATE-----';

var isPemCert = function(data) {
  return data.indexOf(BEGIN_CERT) !== -1 && data.indexOf(END_CERT) !== -1;
};

var getFile = function(path, callback) {
  fs.readFile(path,'utf8', function(err, data) {
    callback(err, data);
  });
};

var processFile = function(path, data, callback) {
  var results = {};
  if(!data || !isPemCert(data)) {
    return errs.handle(
      errs.create({
        message: path + 'is not a .pem file'
      }),
      callback
    );
  }

  results.cert = data;
  results.fingerprint = getFingerPrint(data).toUpperCase();
  callback(null, results);
};

var getFingerPrint = function(pem) {
  // Extract the base64 encoded cert out of pem file
  var beginCert = pem.indexOf(BEGIN_CERT) + BEGIN_CERT.length;
  if (pem[beginCert] === '\n') {
    beginCert = beginCert + 1;
  } else if (pem[beginCert] === '\r' && pem[beginCert + 1] === '\n') {
    beginCert = beginCert + 2;
  }

  var endCert = '\n' + pem.indexOf(END_CERT);
  if (endCert === -1) {
    endCert = '\r\n' + pem.indexOf(END_CERT);
  }

  var certBase64 = pem.substring(beginCert, endCert);

  // Calculate sha1 hash of the cert
  var cert = new Buffer(certBase64, 'base64');
  var sha1 = crypto.createHash('sha1');
  sha1.update(cert);
  return sha1.digest('hex');
};

var getAzureCert = exports.getAzureCert = function(path, next) {

  async.waterfall([
    function(callback) {
      getFile(path,callback);
    },
    function(data, callback) {
      processFile(path, data, callback);
    }],
    function (err, result) {
      // return an object containing the pem file data and the fingerprint
      next(err, result);
    }
  );
};

/*
var uploadAzureCert = exports.uploadAzureCert = function(serviceName, certInfo, serviceManager, next) {
  serviceManager.addCertificate(serviceName, data, format, password, callback) {


}
*/




