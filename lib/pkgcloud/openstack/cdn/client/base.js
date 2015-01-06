/*
 * flavors.js: Instance methods for working with base resources from Openstack CDN
 *
 * (C) 2014 Rackspace
 *      Shaunak Kashyap
 * MIT LICENSE
 */

/**
 * client.getHomeDocument
 *
 * @description gets the home document for the CDN service
 *
 * @param callback
 * @return {*}
 */
exports.getHomeDocument = function(callback) {
  var requestOptions = {
    path: '/'
  };

  return this._request(requestOptions, function (err, body) {
    if (err) {
      return callback(err);
    }

    callback(err, body);
  });
};

/**
 * client.getPing
 *
 * @description gets the server ping response (status response)
 *
 * @param callback
 * @return {*}
 */
exports.getPing = function(callback) {
  var requestOptions = {
    path: '/ping'
  };

  return this._request(requestOptions, function (err) {
    return callback(err);
  });
};
