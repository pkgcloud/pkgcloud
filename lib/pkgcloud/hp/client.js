/*
 * client.js: Base client from which all HP clients inherit from
 *
 * (C) 2014 HP.
 *
 */

var utile = require('utile'),
    identity = require('./identity'),
    base = require('../openstack/client'),
    _ = require('underscore');

var Client = exports.Client = function (options) {
  options = options || {};
  var eastUSRegion = 'region-b.geo-1', westUSRegion='region-a.geo-1',
      eastUSIdentityService='https://region-b.geo-1.identity.hpcloudsvc.com:35357/',
      westUSIdentityService='https://region-a.geo-1.identity.hpcloudsvc.com:35357/';
  if(!options.region){
    throw new Error('region is not valid. Available regions are '+westUSRegion+' (US-West), '+eastUSRegion+'(US-East)');
  }

  if(!options.authUrl || options.authUrl.length === 0) {
    if(options.region === eastUSRegion){
      options.authUrl = eastUSIdentityService;
    }
    else if(options.region === westUSRegion){
      options.authUrl = westUSIdentityService;
    }
    else{
      throw new Error('authUrl is invalid');
    }
  }

  options.identity = identity.Identity;

  if (typeof options.useServiceCatalog === 'undefined') {
    options.useServiceCatalog = true;
  }

  base.Client.call(this, options);

  this.provider = 'hp';
};

utile.inherits(Client, base.Client);

Client.prototype._getIdentityOptions = function() {

  return _.extend({
    apiKey: this.config.apiKey
  }, Client.super_.prototype._getIdentityOptions.call(this));
};
