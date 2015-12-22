/*
 * servers.js: Instance methods for working with servers from DigitalOcean
 *
 * (C) 2012 Charlie Robbins, Ken Perkins, Ross Kukulinski & the Contributors.
 *
 */
var base     = require('../../../core/compute'),
    pkgcloud = require('../../../../../lib/pkgcloud'),
    errs     = require('errs'),
    urlJoin = require('url-join'),
    compute  = pkgcloud.providers.digitalocean.compute;

//
// ### function getVersion (callback)
// #### @callback {function} f(err, version).
//
// Gets the current API version
//
exports.getVersion = function getVersion(callback) {
  return errs.handle(
    errs.create({ message: 'DigitalOcean\'s API does not support versioning' }),
    callback
  );
};

//
// ### function getLimits (callback)
// #### @callback {function} f(err, version).
//
// Gets the current API limits
//
exports.getLimits = function getLimits(callback) {
  return errs.handle(
    errs.create({ message: 'DigitalOcean\'s API is not rate limited' }),
    callback
  );
};

//
// ### function getServers (callback)
// #### @options {Object} Options when getting servers
// ####   @options.per_page {number} **Optional** Number of servers to skip when listing
// ####   @options.page  {number} **Optional** Number of servers to return
// #### @callback {function} f(err, servers). `servers` is an array that
// represents the servers that are available to your account
//
// Lists all servers available to your account.
//
exports.getServers = function getServers(options, callback) {
  if (!callback && typeof options === 'function') {
    callback = options;
    options = {};
  }

  var self = this,
      per_page = options.per_page || 200,
      page = options.page || 1;

  return this._request(
    {
      path: '/v2/droplets',
      qs: {
        per_page: per_page,
        page: page
      }
    },
    function (err, body, res) {
      if (err) {
        return callback(err);
      }

      callback(null, body.droplets.map(function (result) {
        return new compute.Server(self, result);
      }), res);
    }
  );
};

//
// ### function createServer (options, callback)
// #### @opts {Object} **Optional** options
// ####    @name     {String} a name for your server
// ####    @flavor   {String|Flavor} **Optional** flavor to use for this image
// ####    @image    {String|Image} **Optional** the image to use
// ####    @required {Boolean} **Optional** Validate if flavor, name,
// and image are present
// ####    @ipv6 {Boolean} **Optional** Enable IPv6
// ####    @private_networking {Boolean} **Optional** Enable private networking
// ####    @backups {Boolean} **Optional** Enable backups
// ####    @user_data {String} **Optional** Provide cloud-init user-data
// ####    @*        {*} **Optional** Anything platform specific
// #### @callback {Function} f(err, server).
//
// Creates a server with the specified options. The flavor
// properties of the options can be instances of Flavor
// OR ids to those entities in DigitalOcean.
//
exports.createServer = function createServer(options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options  = {};
  }

  options = options || {}; // no args

  var self = this,
      createOptions = {
        method: 'POST',
        path: '/v2/droplets',
        body: {}
      };

  ['flavor', 'image', 'name'].forEach(function (member) {
    if (!options[member]) {
      return errs.handle(
        errs.create({ message: 'options.' + member + ' is a required argument.' }),
        callback
      );
    }
  });

  createOptions.body.name      = options.name;
  createOptions.body.region = options.region || options.region_id || 'nyc3';
  createOptions.body.size   = options.flavor instanceof base.Flavor
    ? options.flavor.id
    : options.flavor;

  createOptions.body.image = options.image instanceof base.Image
    ? options.image.id
    : options.image;

  //
  // Integrate with existing keys API, but support keyNames as well
  // which can be a single string or an Array.
  //
  if (options.keyname) {
    createOptions.body.ssh_keys = options.keyname;
  }
  else if (options.keynames) {
    createOptions.body.ssh_keys = Array.isArray(options.keynames)
      ? options.keynames.join(',')
      : options.keynames;
  }


  //
  // DigitalOcean specific options.
  //
  if (options.ipv6) {
    createOptions.body.ipv6 = options.ipv6;
  }

  if (options.private_networking) {
    createOptions.body.private_networking = options.private_networking;
  }

  if (options.backups) {
    createOptions.body.backups = options.backups;
  }

  if (options.user_data) {
    createOptions.body.user_data = options.user_data;
  }

  return this._request(createOptions, function (err, body, res) {
    return err
      ? callback(err)
      : callback(null, new compute.Server(self, body.droplet), res);
  });
};

//
// ### function destroyServer(server, callback)
// #### @server {Server|String} Server id or a server
// #### [@options] {object} Pass optioos for deletion
// #### [options.scrubData] Optionally disable scrubbing data (boolean),
//        default (true) is to scrub data from Digital Ocean servers
//
// #### @callback {Function} f(err, serverId).
//
// Destroy a server in DigitalOcean.
//
exports.destroyServer = function destroyServer(server, options, callback) {
  var serverId = server instanceof base.Server ? server.id : server;

  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  this._request({
    method: 'DELETE',
    path: urlJoin('/v2/droplets/', serverId)
  }, function (err, body, res) {
    return err ? callback(err) : callback(null, { ok: serverId }, res);
  });
};

//
// ### function getServer(server, callback)
// #### @server {Server|String} Server id or a server
// #### @callback {Function} f(err, serverId).
//
// Gets a server in DigitalOcean.
//
exports.getServer = function getServer(server, callback) {
  var serverId = server instanceof base.Server ? server.id : server,
      self     = this;

  return this._request({
    path: urlJoin('/v2/droplets/', serverId)
  }, function (err, body, res) {
    return !err
      ? callback(null, new compute.Server(self, body.droplet), res)
      : callback(err);
  });
};


//
// ### function rebootServer (server, options, callback)
// #### @server   {Server|String} The server to reboot
// #### @callback {Function} f(err, server).
//
// Reboots a server
//
exports.rebootServer = function rebootServer(server, callback) {
  var serverId = server instanceof base.Server ? server.id : server;
  return this._request({
    method: 'POST',
    path: urlJoin('/v2/droplets/', serverId, '/actions'),
    body: { type: 'reboot' },
  }, function (err, body, res) {
    return err
      ? callback(err)
      : callback(null, { ok: serverId }, res);
  });
};

//
// ### function renameServer(server, name, callback)
// #### @server {Server|String} Server id or a server
// #### @name   {String} New name to apply to the server
// #### @callback {Function} f(err, server).
//
// Renames a server
//
exports.renameServer = function renameServer(server, name, callback) {
  var serverId = server instanceof base.Server ? server.id : server;
  return this._request({
    method: 'POST',
    path: urlJoin('/v2/droplets/', serverId, '/actions'),
    body: {
      type: 'rename',
      name: name
    },
  }, function (err, body, res) {
    return err
      ? callback(err)
      : callback(null, { ok: serverId }, res);
  });
};
