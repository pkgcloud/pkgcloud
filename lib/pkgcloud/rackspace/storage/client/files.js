/*
 * files.js: Instance methods for working with files from Rackspace Cloudfiles
 *
 * (C) 2013 Rackspace, Ken Perkins
 * MIT LICENSE
 *
 */

var fs = require('fs'),
    request = require('request'),
    util = require('util'),
    base = require('../../../core/storage'),
    pkgcloud = require('../../../../pkgcloud'),
    _ = require('underscore');

/**
 * client.purgeFileFromCdn
 * @description Destroys a file in a specified container
 *
 * @function
 * @memberof rackspace/storage
 *
 * @param {object|String}       container       Name or instance of the Container
 * @param {object|String}       file            Name or instance of the File
 * @param {String}              [emails]        Comma delimited list of emails
 * @param {Function}            callback ( error, true )
 */
exports.purgeFileFromCdn = function (container, file, emails, callback) {
  var containerName = container instanceof this.models.Container ? container.name : container,
    fileName = file instanceof this.models.File ? file.name : file;

  if (typeof emails === 'function') {
    callback = emails;
    emails = [];
  }
  else if (typeof emails === 'string') {
    emails = emails.split(',');
  }

  var purgeOptions = {
    method: 'DELETE',
    container: containerName,
    path: fileName,
    serviceType: this.cdnServiceType
  };

  if (emails.length) {
    purgeOptions.headers = {};
    purgeOptions.headers['x-purge-email'] = emails.join(',');
  }

  this._request(purgeOptions, function (err) {
      return err
        ? callback(err)
        : callback(null, true);
    }
  );
};
