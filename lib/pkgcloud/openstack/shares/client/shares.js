/*
 * meters.js: Methods for working with meters from Openstack Ceilometer
 *
 * (C) 2015 Hans Cornelis
 * MIT LICENSE
 *
 *
 */
var Share = require('../share').Share,
    urlJoin = require('url-join'),
    QStringify = require('../utils/utils.js');

var _urlPrefix = 'shares';

/**
 * client.getShares
 *
 * @description Get All the shares
 * @param {function}        callback
 * @returns  [*]
 */
exports.getShares = function (callback) {
    var self = this,
        requestOptions;

    requestOptions = {
        path : urlJoin(self.version,_urlPrefix, 'detail')
    };

    return self._request(requestOptions, function (err, body, res) {
        return err
            ? callback(err)
            : callback(null, body.map(function (data) {
            return new Share(self, data);
        }), res);
    });
};

/**
 * client.getShare
 *
 * @description Get the details for the provided share
 *
 * @param options       String  Share ID
 * @param {function}        callback
 * @returns [*]
 */
exports.getShare = function (options, callback) {
    var self = this,
    //meter_id = options instanceof Meter ? options.meter_id : options,
        requestOptions;

    requestOptions = {
        path : urlJoin(self.version,_urlPrefix, options)
    };

    return self._request(requestOptions, function (err, body, res) {
        return err
            ? callback(err)
            : callback(null, body.map(function (data) {
            return new Share(self, data);
        }), res);
    });
};

/**
 * client.createShare
 *
 * @description Creates a share
 *
 * @param options   Object Your Share
 *
 * { share: {
 *  volume_type: ...,
 *  name: ...,
 *  description: ...,
 *  share_proto: ...,
 *  share_network_id: ...,
 *  size:
 *  }
 *  (See: https://wiki.openstack.org/wiki/Manila/API#Shares)
 *
 * @param {function}            callback
 */
exports.createShare = function (options, callback) {
    var self = this;

    var createOptions = {
        method: 'POST',
        path: urlJoin(self.version, _urlPrefix),
        body: options
    };

    self._request(createOptions, function (err, body) {
        return err
            ? callback(err)
            : callback(null, body.map(function (x) {
            return new Share(self, x);
        }));
    });
};

/**
 * client.deleteShare
 *
 * @param id    String  Share ID
 */
exports.deleteShare = function(id, callback) {
    var self = this;

    var createOptions = {
        method: 'DELETE',
        path: urlJoin(self.version,_urlPrefix, id)
    };

    self._request(createOptions, function (err, body) {
        return err
            ? callback(err)
            : callback(null, body);
    })

};

