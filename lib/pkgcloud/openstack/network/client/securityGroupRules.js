/*
 * securityGroupRules.js: Instance methods for working with security group rules
 * for Openstack Networking
 *
 * (C) 2015 Rackspace
 *      Shaunak Kashyap
 * MIT LICENSE
 */

var urlJoin = require('url-join');

var securityGroupRulesResourcePath = '/security-group-rules';

// Declaring variables for helper functions defined later
var _convertSecurityGroupRuleToWireFormat;

/**
 * client.getSecurityGroupRules
 *
 * @description get the list of security group rules for an account
 *
 * @param {object|Function}   options
 * @param {Function}          callback
 */
exports.getSecurityGroupRules = function (options, callback) {
  var self = this;

  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  var getSecurityGroupRuleOpts = {
    path: securityGroupRulesResourcePath
  };

  this._request(getSecurityGroupRuleOpts, function (err, body) {
    if (err) {
      return callback(err);
    }
    else if (!body || !body.security_group_rules || !(body.security_group_rules instanceof Array)) {
      return new Error('Malformed API Response');
    }

    return callback(err, body.security_group_rules.map(function (securityGroupRule) {
      return new self.models.SecurityGroupRule(self, securityGroupRule);
    }));
  });
};

/**
 * client.getSecurityGroupRule
 *
 * @description get the details for a specific securityGroupRule
 *
 * @param {String|object}     securityGroupRule     the securityGroupRule or securityGroupRuleId
 * @param callback
 */
exports.getSecurityGroupRule = function (securityGroupRule, callback) {
  var self = this,
    securityGroupRuleId = securityGroupRule instanceof this.models.SecurityGroupRule ? securityGroupRule.id : securityGroupRule;
  self.emit('log::trace', 'Getting details for security group rule', securityGroupRuleId);
  this._request({
    path: urlJoin(securityGroupRulesResourcePath, securityGroupRuleId),
    method: 'GET'
  }, function (err, body) {
    if (err) {
      return callback(err);
    }

    if (!body ||!body.security_group_rule) {
      return new Error('Malformed API Response');
    }

    callback(err, new self.models.SecurityGroupRule(self, body.security_group_rule));
  });
};

/**
 * client.createSecurityGroupRule
 *
 * @description create a new securityGroupRule
 *
 * @param object      securityGroupRule
 * @param string      securityGroupRule.securityGroupId The security group ID to associate with this security group rule.
 * @param string      securityGroupRule.direction       The direction ("ingress" or "egress") in which the security group rule is applied.
 * @param {string}    securityGroupRule.ethertype       "IPv4" or "IPv6".
 * @param {number}    securityGroupRule.portRangeMin    The minimum port number in the range that is matched by the security group rule.
 * @param {number}    securityGroupRule.portRangeMax    The maximum port number in the range that is matched by the security group rule.
 * @param {string}    securityGroupRule.protocol        The protocol ("tcp", "udp", or "icmp") that is matched by the security group rule.
 * @param {string}    securityGroupRule.remoteGroupId   The remote group ID to be associated with this security group rule. You can specify either this or remoteIpPrefix.
 * @param {string}    securityGroupRule.remoteIpPrefix  The remote IP prefix to be associated with this security group rule. You can specify either this or remoteGroupId.
 * 
 * @param callback
 */
exports.createSecurityGroupRule = function (securityGroupRule, callback) {
  var self = this;

  securityGroupRule = _convertSecurityGroupRuleToWireFormat(securityGroupRule);

  var createSecurityGroupRuleOpts = {
    method: 'POST',
    path: securityGroupRulesResourcePath,
    body: { 'security_group_rule': securityGroupRule }
  };

  self.emit('log::trace', 'Creating security group rule', securityGroupRule);
  this._request(createSecurityGroupRuleOpts, function (err,body) {
    return err
      ? callback(err)
      : callback(err, new self.models.SecurityGroupRule(self, body.securityGroupRule));
  });
};

/**
 * client.destroySecurityGroupRule
 *
 * @description Delete a specific securityGroupRule
 *
 * @param {String|object}     securityGroupRule     the securityGroupRule or securityGroupRule ID
 * @param callback
 */
exports.destroySecurityGroupRule = function (securityGroupRule, callback) {
  var self = this,
    securityGroupRuleId = securityGroupRule instanceof this.models.SecurityGroupRule ? securityGroupRule.id : securityGroupRule;
  self.emit('log::trace', 'Deleting security group rule', securityGroupRuleId);
  this._request({
    path: urlJoin(securityGroupRulesResourcePath,securityGroupRuleId),
    method: 'DELETE'
  }, function (err) {
    if (err) {
      return callback(err);
    }
    callback(err, securityGroupRuleId);
  });
};

/**
 * _convertSecurityGroupRuleToWireFormat
 *
 * @description convert SecurityGroupRule instance into its wire representation.
 *
 * @param {object}     details    the SecurityGroupRule instance.
 */
_convertSecurityGroupRuleToWireFormat = function (details){
    var wireFormat = {};
    wireFormat.direction = details.direction;
    wireFormat.ethertype = details.ethertype;
    wireFormat.security_group_id = details.security_group_id || details.securityGroupId;
    wireFormat.port_range_min = details.port_range_min || details.portRangeMin;
    wireFormat.port_range_max = details.port_range_max || details.portRangeMax;
    wireFormat.protocol = details.protocol;
    wireFormat.remote_group_id = details.remote_group_id || details.remoteGroupId;
    wireFormat.remote_ip_prefix = details.remote_ip_prefix || details.remoteIpPrefix;
    return wireFormat;
};
