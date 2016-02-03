/*
 * access.js: Methods for working with access on Manila shares
 *
 * (C) 2015 Hans Cornelis
 * MIT LICENSE
 *
 * https://wiki.openstack.org/wiki/Manila/API#Share_Actions
 *
 */
var Access = require('../access').Access,
    urlJoin = require('url-join');

var _urlPrefix = 'shares';

/**
 * Allow access to a share
 *
 * @param id        STRING      The id of the share
 * @param options   OBJECT
 *        options.access_to     STRING IP-address or range
 *        options.access_type   STRING ip or something else
 * @param callback
 */
exports.allowAccess = function (id, options, callback) {
  var self = this,
      requestOptions;

    requestOptions = {
        path : urlJoin(_urlPrefix, id, 'action'),
        method: 'POST',
        body: {
            'os-allow_access': options
        }
    };

    return self._request(requestOptions, function (err, body, res) {
        return err
            ? callback(err)
            : callback(null, new Access(self, body.access));
    });

};

/**
 * Remove a specific access ID
 *
 * @param id            STRING  The share ID
 * @param accessRuleID  STRING  The ID of the access rule
 * @param callback
 */
exports.denyAccess = function (id, accessRuleID, callback) {
    var self = this,
        requestOptions;

    requestOptions = {
        path: urlJoin(_urlPrefix, id, 'action'),
        method: 'POST',
        body: { 'os-deny_access': accessRuleID }
    };

    return self._request(requestOptions, function (err, body, res) {
        return err
            ? callback(err)
            : callback(null, { status: 'success' });
    })
};

exports.listAccessRules = function (id, callback) {
    var self = this,
        requestOptions;

    requestOptions = {
        path: urlJoin(_urlPrefix, id, 'action'),
        method: 'POST',
        body: { 'os-access_list': null }
    };

    return self._request(requestOptions, function (err, body, res) {
        return err
            ? callback(err)
            : callback(null, body.access_list.map(function (data) {
            return new Access(self, data);
        }))
    })
}
