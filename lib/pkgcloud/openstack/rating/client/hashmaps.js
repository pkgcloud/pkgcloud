/*
 * hashmaps.js: Instance methods for working with hashmaps from Cloudkitty
 *
 * (C) 2015 Hopebaytech
 *      Julian Liu
 * MIT LICENSE
 *
 *
 */
var _ = require('underscore');
var urlJoin = require('url-join');

var _urlPrefix = 'v1';

/**
 * client.getServices
 *
 * @description Get the service list
 * @param {Function}          callback
 */
exports.getServices = function (callback) {
  this._request({
    path: urlJoin(_urlPrefix, 'rating/module_config/hashmap/services')
  }, function (err, body) {
    if (err) {
      return callback(err);
    }
    return callback(null, body.services.map(function (data) {
      return _.pick(data, ['service_id', 'name']);
    }));
  });
};

/**
 * client.getService
 *
 * @description Get details for provided service
 * @param {String}            service  The service id for the query
 * @param {Function}          callback
 */
exports.getService = function (service, callback) {
  this._request({
    path: urlJoin(urlJoin(_urlPrefix, 'rating/module_config/hashmap/services'), service)
  }, function (err, body) {
    if (err) {
      return callback(err);
    }
    return callback(null, _.pick(body, ['service_id', 'name']));
  });
};

/**
 * client.getFields
 *
 * @description Get the field list for provided service
 * @param {String}            service  The service id for the query
 * @param {Function}          callback
 */
exports.getFields = function (service, callback) {
  this._request({
    path: urlJoin(_urlPrefix, 'rating/module_config/hashmap/fields'),
    qs: {service_id: service}
  }, function (err, body) {
    if (err) {
      return callback(err);
    }
    return callback(null, body.fields.map(function (data) {
      return _.pick(data, ['field_id', 'name', 'service_id']);
    }));
  });
};

/**
 * client.getField
 *
 * @description Get details for provied field
 * @param {String}            field  The field id for the query
 * @param {Function}          callback
 */
exports.getField = function (field, callback) {
  this._request({
    path: urlJoin(urlJoin(_urlPrefix, 'rating/module_config/hashmap/fields'), field)
  }, function (err, body) {
    if (err) {
      return callback(err);
    }
    return callback(null, _.pick(body, ['field_id', 'name', 'service_id']));
  });
};

/**
 * client.getMappings
 *
 * @description Get the mapping list for provided service or field or group (1 needed at least)
 * @param {object}            options
 * @param {String}            [options.service_id]  service id for the query.
 * @param {String}            [options.field_id]  field id for the query.
 * @param {String}            [options.group_id]  group id for the query.
 * @param {Function}          callback
 */
exports.getMappings = function (options, callback) {
  this._request({
    path: urlJoin(_urlPrefix, 'rating/module_config/hashmap/mappings'),
    qs: _.pick(options, ['service_id', 'field_id', 'group_id'])
  }, function (err, body) {
    if (err) {
      return callback(err);
    }
    return callback(null, body.mappings.map(function (data) {
      return _.pick(data, ['mapping_id', 'value', 'map_type', 'cost', 'service_id', 'field_id', 'group_id']);
    }));
  });
};

/**
 * client.getMapping
 *
 * @description Get details for provied mapping
 * @param {String}            mapping  The mapping id for the query
 * @param {Function}          callback
 */
exports.getMapping = function (mapping, callback) {
  this._request({
    path: urlJoin(urlJoin(_urlPrefix, 'rating/module_config/hashmap/mappings'), mapping)
  }, function (err, body) {
    if (err) {
      return callback(err);
    }
    return callback(null, _.pick(body, ['mapping_id', 'value', 'map_type', 'cost', 'service_id', 'field_id', 'group_id']));
  });
};
