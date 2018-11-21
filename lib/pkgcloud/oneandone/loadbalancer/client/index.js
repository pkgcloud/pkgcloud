/**
 * Created by Ali Bazlamit on 8/31/2017.
 */

var util = require('util'),
  oneandone = require('../../client'),
  _ = require('lodash');

var Client = exports.Client = function (options) {
  oneandone.Client.call(this, options);

  _.extend(this, require('./loadbalancers'));
  _.extend(this, require('./nodes'));

};

util.inherits(Client, oneandone.Client);