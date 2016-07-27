/*
 * servers.js: Instance methods for working with servers from AWS Cloud
 *
 * (C) 2012 Charlie Robbins, Ken Perkins, Ross Kukulinski & the Contributors.
 *
 */
var async = require('async'),
    base     = require('../../../core/compute'),
    pkgcloud = require('../../../../../lib/pkgcloud'),
    errs     = require('errs'),
    compute  = pkgcloud.providers.amazon.compute;

//
// ### function getVersion (callback)
// #### @callback {function} f(err, version).
//
// Gets the current API version
//
exports.getVersion = function getVersion(callback) {
  var self = this;
  process.nextTick(function() {
    callback(null, self.version);
  });
};

//
// ### function getLimits (callback)
// #### @callback {function} f(err, version).
//
// Gets the current API limits
//
exports.getLimits = function getLimits(callback) {
  return errs.handle(
    errs.create({ message: 'AWS\'s API is not rate limited' }),
    callback
  );
};

//
// ### function _getDetails (details, callback)
// #### @details {Object} Short details of server
// #### @callback {function} f(err, details) Amended short details.
//
// Loads name of server.
//
exports._getDetails = function getDetails(details, callback) {
  var tags = details.Tags;
  var i;
  var len = tags.length;

  for (i = 0; i < len; ++i) {
    if (tags[i].Key === 'Name') {
      details.name = tags[i].Value;
      break;
    }
  }
  callback(null, details);
};

//
// ### function getServers (callback)
// #### @callback {function} f(err, servers). `servers` is an array that
// represents the servers that are available to your account
//
// Lists all servers available to your account.
//
exports.getServers = function getServers(options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  var self = this;

  self.ec2.describeInstances(options, function(err, data) {
    if (err) {
      callback(err);
      return;
    }

    var servers = [];

    data.Reservations.forEach(function(reservation) {
      reservation.Instances.forEach(function(instance) {
        servers.push(instance);
      });
    });

    async.map(servers,
      self._getDetails.bind(self),
      function finish(err, servers) {
        return err
          ? callback(err)
          : callback(null, servers.map(function (server) {
          return new compute.Server(self, server);
        }));
      }
    );
  });
};

//
// ### function createServer (options, callback)
// #### @opts {Object} **Optional** options
// ####    @name     {String} **Optional** the name of server
// ####    @image    {String|Image} the image (AMI) to use
// ####    @flavor   {String|Flavor} **Optional** flavor to use for this image
// #### @callback {Function} f(err, server).
//
// Creates a server with the specified options. The flavor
// properties of the options can be instances of Flavor
// OR ids to those entities in AWS.
//
exports.createServer = function createServer(options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options  = {};
  }

  options = options || {}; // no args
  var self = this,
    createOptions = {
      MinCount: 1,
      MaxCount: 1
    },
    securityGroup,
    securityGroupId;

  if (!options.image) {
    return errs.handle(
      errs.create({
        message: 'options.image is a required argument.'
      }),
      callback
    );
  }

  securityGroup = this.securityGroup || options['SecurityGroup'];
  if (securityGroup) {
    createOptions['SecurityGroups'] = [securityGroup];
  }

  securityGroupId = this.securityGroupId || options['SecurityGroupId'];
  if (securityGroupId) {
    createOptions['SecurityGroupIds'] = [securityGroupId];
  }

  if (options.UserData) {
    createOptions.UserData = new Buffer(options.UserData).toString('base64');
  }

  createOptions.ImageId = options.image instanceof base.Image
    ? options.image.id
    : options.image;

  if (options.flavor) {
    createOptions.InstanceType = options.flavor instanceof base.Flavor
      ? options.flavor.id
      : options.flavor;
  }

  if (options.keyname || options.KeyName) {
    createOptions.KeyName = options.keyname || options.KeyName;
  }

  if (options.zone || options['Placement.AvailabilityZone']) {
    createOptions['Placement.AvailabilityZone'] = options.zone
      || options['Placement.AvailabilityZone'];
  }

  self.ec2.runInstances(createOptions, function(err, data) {
    if (err) {
      return callback(err);
    }

    var server = new compute.Server(self, data.Instances[0]);

    self.ec2.createTags({
      Resources: [
        server.id
      ],
      Tags: [{
        Key: 'Name',
        Value: options.name
      }]
    }, function (err) {
      if (err) {
        callback(err, server);
      } else {
        callback(null, server);
      }
    });

  });
};

//
// ### function destroyServer(server, callback)
// #### @server {Server|String} Server id or a server
// #### @callback {Function} f(err, serverId).
//
// Destroy a server in AWS.
//
exports.destroyServer = function destroyServer(server, callback) {
  var self = this,
    serverId = server instanceof base.Server ? server.id : server;

  self.ec2.terminateInstances({
    InstanceIds: [ serverId ]
  }, function(err) {
    return err
      ? callback && callback(err)
      : callback && callback(null, { ok: serverId });
  });
};

//
// ### function getServer(server, callback)
// #### @server {Server|String} Server id or a server
// #### @callback {Function} f(err, serverId).
//
// Gets a server in AWS.
//
exports.getServer = function getServer(server, callback) {
  var self     = this,
      serverId = server instanceof base.Server ? server.id : server;

  self.ec2.describeInstances({
      InstanceIds: [ serverId ],
      Filters: [
        { Name: 'instance-state-code',
          Values : [ '0', '16', '32', '64', '80' ] }
      ]
  }, function (err, data) {
      var server;

      if (err) {
        return callback(err);
      }

      data.Reservations.forEach(function(reservation) {
        reservation.Instances.forEach(function (instance) {
          server = instance;
        });
      });

      if (server === undefined) {
        return callback(new Error('Server not found'));
      }

      self._getDetails(server, function (err, server) {
        if (err) {
          return callback(err);
        }

        callback(null, new compute.Server(self, server));
      });
    }
  );
};


//
// ### function rebootServer (server, options, callback)
// #### @server   {Server|String} The server to reboot
// #### @callback {Function} f(err, server).
//
// Reboots a server
//
exports.rebootServer = function rebootServer(server, callback) {
  var self = this,
    serverId = server instanceof base.Server ? server.id : server;

  self.ec2.rebootInstances({
    InstanceIds: [ serverId ]
  }, function (err) {
    return err
      ? callback && callback(err)
      : callback && callback(null, { ok: serverId });
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
  return errs.handle(
    errs.create({ message: 'Not supported by AWS.' }),
    callback
  );
};
