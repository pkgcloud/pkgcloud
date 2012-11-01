/*
 * cert.js: methods to handle Azure pem certificate
 *
 * pem functions borrowed from azure/utils
 * (C) Microsoft Open Technologies, Inc.
 *
 */

/*
How to create SSH cert on linux/mac

// create pem file and key file
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout myPrivateKey.key -out mycert.pem

//Change the permissions on the private key to secure it.
chmod 600 mycert.pem
chmod 600 myPrivateKey.key

// convert pem to pfx
openssl pkcs12 -export -out mycert.pfx -in mycert.pem -inkey myPrivateKey.key -name "My Certificate"

// how to create a .cer file
openssl x509 -inform pem -in mycert.pem -outform der -out mycert.cer

*/

/*

How to create Service Management  cert on linux/mac

// create rsa private key
openssl genrsa -out management.key 2048

// create self signed certificate
openssl req -new -key management.key -out management.csr

// create temp pem file from rsa key and self signed certificate
openssl x509 -req -days 3650 -in management.csr -signkey management.key -out temp.pem

// create management pem from temp pem file and rsa key file
cat management.key temp.pem > management.pem

// create management pfx
openssl pkcs12 -export -out management.pfx -in temp.pem -inkey management.key -name "My Certificate"

// create management cer
openssl x509 -inform pem -in management.pem -outform der -out management.cer

// secure files
chmod 600 *.*





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
  fs.readFile(path, function(err, data) {
    callback(err, data);
  });
};

var processFile = function(path, data, callback) {
  var results = {};
  var pemStr = data.toString();
  if(!data || !isPemCert(pemStr)) {
    return errs.handle(
      errs.create({
        message: path + ' is not a .pem file'
      }),
      callback
    );
  }

  results.cert = data;
  results.fingerprint = getFingerPrint(pemStr).toUpperCase();
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




