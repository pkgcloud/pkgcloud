/*
 * shares.js: Methods for working with shares from Openstack Manila
 *
 * (C) 2015 Hans Cornelis
 * MIT LICENSE
 *
 *
 */
var Share = require('../share').Share,
    urlJoin = require('url-join');

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
        path : urlJoin(_urlPrefix, 'detail')
    };

    return self._request(requestOptions, function (err, body, res) {
        return err
            ? callback(err)
            : callback(null, body.shares.map(function (data) {
            return new Share(self, data);
        }), res);
    });
};

/**
 * client.getShare
 *
 * @description Get the details for the provided share
 *
 * @param id       String  Share ID
 * @param {function}        callback
 * @returns [*]
 */
exports.getShare = function (id, callback) {
    var self = this,
        requestOptions;

    requestOptions = {
        path : urlJoin(_urlPrefix, id),
        method: 'GET'
    };

    return self._request(requestOptions, function (err, body, res) {
        return err
            ? callback(err)
            : callback(null, new Share(self, body.share));
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
        path:_urlPrefix ,
        body: {
            share: options
    }};


    self._request(createOptions, function (err, body) {
        return err
            ? console.log(err)
            : callback(null, new Share(self, body.share));
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
        path: urlJoin(_urlPrefix, id)
    };

    self._request(createOptions, function (err, body) {
        return err
            ? callback(err)
            : callback(null, body);
    })

};

