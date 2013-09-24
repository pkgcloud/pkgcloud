/*
 * bootstrapper.js: Core methods for bootstrapping servers in pkgcloud.
 *
 * (C) 2010, Nodejitsu Inc.
 *
 */

var events = require('events'),
    fs = require('fs'),
    path = require('path'),
    spawn = require('child_process').spawn,
    async = require('async'),
    events2 = require('eventemitter2'),
    utile = require('utile'),
    pkgcloud = require('../../../pkgcloud');

//
// ### function Bootstrapper (options)
// #### @options {Object} Options for this instance.
// ##### @compute {Object} Options for compute
// ###### @provider {String} Name of the provider
//
// Constructor function for the Bootstrapper object which contains
// base functionality for all bootstappers in conservatory.
//
var Bootstrapper = exports.Bootstrapper = function (options) {
  if (!options) {
    throw new Error('Missing required `options`');
  }

  events2.EventEmitter2.call(this, options);

  this.provider   = (options.compute && options.compute.provider) || 'rackspace';
  this.keys       = options.keys;
  this.retryLimit = options.retryLimit || 3;
  this.remoteUser = options.remoteUser || 'root';

  //
  // Create a pkgcloud compute client with `options.compute` or
  // the stored configuration in `conservatory`.
  //
  if (options.compute) {
    this.compute = pkgcloud.compute.createClient(options.compute);
  }
};

//
// Inherit from `EventEmitter2`
//
utile.inherits(Bootstrapper, events2.EventEmitter2);

//
// ### function readKeys (callback)
// #### @callback {function} Continuation to respond to when complete.
// Reads the SSH keypair specified by the paths in `this.keys`.
//
Bootstrapper.prototype.readKeys = function (callback) {
  var keyinfo = {};

  //
  // Helper function which populates a given field (`public`, `private`)
  // in the keys info to be returned.
  //
  function readKey(key, next) {
    var keytype = path.extname(key) === '.pub' ? 'public' : 'private';
    fs.readFile(key, function (err, data) {
      if (err) {
        return next(err);
      }

      keyinfo[keytype] = {
        raw:    data.toString(),
        base64: data.toString('base64'),
        name:   path.basename(key),
        path:   key
      };

      next();
    });
  }
  //
  // Helper function to iterate the array of keys
  //
  function iterateKeys(keys) {
    async.forEach(keys, readKey, function (err) {
      return err ? callback(err) : callback(null, keyinfo);
    });
  }
  //
  // Logic to interpret if this.keys are an array or an object
  //
  if (this.keys instanceof Array) {
    iterateKeys(this.keys);
  } else if (this.keys && this.keys.hasOwnProperty('public') && this.keys.hasOwnProperty('private')) {
    iterateKeys([this.keys.public, this.keys.private]);
  }
};

//
// ### function createServer (options)
// #### @options {Object} Options to create the server with.
// Creates a server with the specified `options`:
//
// (required)
// * options.name:      Name of the server
// * options.imageId:   ImageId of the server (e.g. Ubuntu)
// * options.flavorId:  FlavorId of the server (e.g. 256MB server)
//
// (optional)
// * options.commands:    Commands to run after server is created.
// * options.files:       Files to upload after server is created.
// * options.tunnel.host: Intermediary server to tunnel through
// * options.tunnel.port: Tunnel port for the specified `options.address`.
//
Bootstrapper.prototype.createServer = function (options) {
  var self    = this,
      emitter = new events.EventEmitter(),
      hasErr  = false,
      creator;

  //
  // Helper for handling errors
  //
  function onError(err) {
    if (!hasErr) {
      hasErr = true;
      emitter.emit('error', err);
    }
  }

  //
  // Helper for throwing errors on bad options.
  //
  function badOption(err) {
    if (!hasErr) {
      hasErr = true;
      process.nextTick(function () {
        emitter.emit('error', err);
      });
    }
  }

  //
  // Throw an error if there are no options
  //
  if (!options) {
    return badOption(new Error('Missing required options.'));
  }

  //
  // Throw an error if any options is missing.
  //
  ['name', 'imageId', 'flavorId'].forEach(function (key) {
    if (!options[key]) {
      return badOption(new Error('Missing required option: ' + key));
    }
  });

  //
  // Read the SSH keys associated with this instance to
  // place on the target machine.
  //
  this.readKeys(function (err, keys) {
    if (err) {
      return onError(err);
    }
    else if (hasErr) {
      return;
    }

    var createOptions = { name: options.name };

    if (options.imageId) {
      createOptions.image = options.imageId;
    }

    if (options.flavorId) {
      createOptions.flavor = options.flavorId;
    }

    //
    // Remark: If there are any parameters specific to this
    // compute provider then set them appropriately before
    // creating the server.
    //
    // This is where we do things like set `key_name` (OpenStack)
    // vs. `KeyName` (EC2).
    //
    if (self.compute.bootstrapOptions) {
      utile.mixin(createOptions, self.compute.bootstrapOptions(options, keys));
    }

    creator = self._createServer(createOptions);
    creator.on('error', onError);
    creator.on('create', function (server) {
      emitter.emit('create', server);
    });

    creator.on('active', function (server) {
      emitter.emit('active', server);

      options.keys = keys;
      options.server = server;

      function waitForLatentBind(err) {
        if (err) {
          return emitter.emit('error', err);
        }

        //
        // Grace period for IP propagation
        //
        self._sshPoll(options, function (err) {
          if (err) {
            return onError(err);
          }

          self.bootstrapServer(options)
            .on('error', onError)
            .on('complete', function () {
              if (!options.afterActive) {
                return emitter.emit('complete', server);
              }

              options.afterActive(self.compute, server, function (err) {
                return err
                  ? emitter.emit('error', err)
                  : emitter.emit('complete', server);
              });
            });
        });
      }

      return options.afterCreate
        ? options.afterCreate(self.compute, server, waitForLatentBind)
        : waitForLatentBind();
    });
  });

  return emitter;
};

//
// ### function bootstrapServer (options)
// #### @options {Object} Options with which to bootstrap the server.
//
// Bootstraps the server with the specified `options`:
//
// 1. Creates the base directories for `options.files` using `mkdir -p`.
// 2. Uploads all files in `options.files`.
// 3. Runs all `options.commands` over SSH.
//
// (required)
// * options.keys:   SSH key pair to install on the server.
// * options.server: Server to bootstrap.
//
// (optional)
// * options.files:    Files to upload.
// * options.commands: Commands to execute.
//
Bootstrapper.prototype.bootstrapServer = function (options) {
  var emitter = new events.EventEmitter(),
      hasErr = false,
      self = this;

  //
  // Helper for handling errors
  //
  function onError(err) {
    if (!hasErr) {
      hasErr = true;
      emitter.emit('error', err);
    }
  }

  //
  // Helper function which uploads files of the form:
  //
  //    {
  //      target: '/full/remote/path/to/upload/to',
  //      source: '/full/local/path/to/upload/from'
  //    }
  //
  function uploadFile(file, next) {
    var uploadErr;

    self.uploadFile({
      source: file.source,
      target: file.target,
      server: options.server,
      keys: options.keys,
      tunnel: options.tunnel,
      remoteUser: options.remoteUser
    }).on('error', function (err) {
      if (!uploadErr) {
        uploadErr = true;
        next(err);
      }
    }).on('complete', function () {
      if (!uploadErr) {
        next();
      }
    });
  }

  //
  // Now that the server is active upload any required files
  // and run the specified `options.commands`.
  //
  async.waterfall([
    //
    // 1. Create any remote directories for files that will
    //    be uploaded.
    //
    function createDirs(next) {
      if (!options.files || !options.files.length) {
        return next();
      }

      self.ssh({
        keys: options.keys,
        server: options.server,
        tunnel: options.tunnel,
        remoteUser: options.remoteUser,
        commands: ['mkdir -p ' + options.files.map(function (file) {
          return path.dirname(file.target);
        }).join(' ')]
      }).on('error', function (err) {
        if (!hasErr) {
          hasErr = true;
          next(err);
        }
      }).on('complete', function () {
        if (!hasErr) {
          next();
        }
      });
    },

    //
    // 2. Upload any required files.
    //
    function uploadFiles(next) {
      return options.files && options.files.length
        ? async.forEachSeries(options.files, uploadFile, next)
        : next();
    },
    //
    // 3. Bootstrap the server with the appropriate commands.
    //
    function bootstrap(next) {
      if (!options.commands || !options.commands.length) {
        return next();
      }

      var hasErr;

      self.ssh({
        keys: options.keys,
        server: options.server,
        commands: options.commands,
        remoteUser: options.remoteUser,
        tunnel: options.tunnel
      }).on('error', function (err) {
        if (!hasErr) {
          hasErr = true;
          next(err);
        }
      }).on('complete', function (server, stdout) {
        if (!hasErr) {
          next(null, stdout);
        }
      });
    }
  ], function (err, stdout) {
    //
    // 3. Emit the approrpriate event depending if there is
    //    an error or not.
    //
    return err
      ? onError(err)
      : emitter.emit('complete', options.server, stdout);
  });

  return emitter;
};

//
// ### function downloadFile (options)
// #### @options {Object} Options for downloading the file.
//
// Downloads a file using the specified `options`:
//
// * options.keys:   SSH keypair to authenticate with
// * options.server: Server to download options.source from
// * options.source: Remote full-path to download from
// * options.target: Local full-path to download to
//
// (optional)
// * options.address: IP Address of the server
//
Bootstrapper.prototype.downloadFile = function (options) {
  options.source = (options.remoteUser || this.remoteUser) + '@' +
    (options.address || pkgcloud.compute.serverIp(options.server)) + ':' +
    options.source;

  return this.scp(options);
};

//
// ### function uploadFile (options)
// #### @options {Object} Options for uploading the file.
//
// Uploads a file using the specified `options`:
//
// * options.keys:   SSH keypair to authenticate with
// * options.server: Server to upload options.source to
// * options.source: Local full-path to upload from
// * options.target: Remote full-path of the file
//
// (optional)
// * options.address: IP Address of the server
//
Bootstrapper.prototype.uploadFile = function (options) {
  options.target = (options.remoteUser || this.remoteUser) + '@' +
    (options.address || pkgcloud.compute.serverIp(options.server)) + ':' +
    options.target;

  return this.scp(options);
};

//
// ### function runScriptRemotely (options)
// #### @options {Object} Options containing the script to run remotely.
// Runs the script specified by `options.script` remotely on the
// server supplied by `options.server`.
//
Bootstrapper.prototype.runScriptRemotely = function (options) {
  var self    = this,
      server  = options.server,
      script  = options.script,
      vars    = options.vars || {},
      extra   = options.commands || [],
      emitter = new events.EventEmitter(),
      address = options.address || pkgcloud.compute.serverIp(options.server);

  this.emit(['run', 'script'], {
    script: script,
    address: address
  });

  fs.readFile(script, 'utf8', function (err, file) {
    if (err) {
      return emitter.emit('error', err);
    }

    Object.keys(vars).forEach(function (variable) {
      //
      // Remark: THIS IS WHITESPACE SENSITIVE.
      //
      var regex = new RegExp('{{ ' + variable + ' }}', 'g');
      file = file.replace(regex, vars[variable]);
    });

    var runOptions,
        runner;

    runOptions = {
      address: options.address,
      commands: file.split('\n').concat(extra).filter(Boolean),
      keys: options.keys,
      server: server,
      tunnel: options.tunnel
    };

    runner = self.ssh(runOptions);
    runner.on('error', function (err) {
      self.emit(['run', 'script', 'error'], {
        script: script,
        error: err.message
      });

      emitter.emit('error', err);
    });

    runner.on('complete', function (server) {
      self.emit(['run', 'script', 'success'], {
        script: script,
        address: options.address || pkgcloud.compute.serverIp(options.server)
      });

      emitter.emit('complete', server);
    });
  });

  return emitter;
};

//
// ### function scp (options)
// #### @options {Object} Options to use for the scp operation.
// Executes the `scp` operation with the specified `options`.
//
Bootstrapper.prototype.scp = function (options) {
  var server   = options.server,
      address  = options.address || pkgcloud.compute.serverIp(options.server);

  this.emit(['run', 'scp', 'begin'], {
    address: address,
    source: options.source,
    target: options.target,
    keyfile: path.basename(options.keys['private'].path)
  });

  options.address = address;

  return this._exec('scp', {
    address: address,
    server: options.server,
    exit: options.exit,
    options: this._scpOptions(options)
  });
};

//
// ### function ssh (options)
// #### @options {Object} Options containing the commands to run remotely.
// Runs the commands specified by `options.commands` via ssh remotely on the
// server supplied by `options.server`.
//
Bootstrapper.prototype.ssh = function (options) {
  var server = options.server,
      address = options.address || pkgcloud.compute.serverIp(options.server),
      sshOptions;

  this.emit(['run', 'ssh', 'begin'], {
    address: address,
    commands: options.commands,
    keyfile: path.basename(options.keys['private'].path)
  });

  sshOptions = [
    '-i',
    options.keys['private'].path,
    '-q',
    '-o',
    'StrictHostKeyChecking=no',
    '-o',
    'PasswordAuthentication=no'
  ];

  if (options.tunnel) {
    options.address = address;
    sshOptions = this._tunnel(sshOptions, options);
  }

  return this._exec('ssh', {
    address: address,
    server: server,
    exit: options.exit,
    options: sshOptions.concat([
      [options.remoteUser || this.remoteUser, address].join('@'),
      options.commands.join(' && ')
    ])
  });
};

//
// ### @private function _createServer (options)
// #### @options {Object} Options to create the server with
// Creates a new server using the specified `options`.
//
Bootstrapper.prototype._createServer = function (options) {
  var self    = this,
      tries   = options.tries || 0,
      run     = false,
      emitter = new events.EventEmitter();

  this.emit(['server', 'create'], { name: options.name, attempt: tries });
  this.emit(['server', 'create'], options);

  (function tryAdd() {
    self.compute.createServer(options, function (err, server) {
      if (err) {
        self.emit(['server', 'create'], {
          name: options.name,
          attempt: tries,
          error: err.message
        });

        tries += 1;
        return tries < self.retryLimit ? tryAdd() : emitter.emit('error', err);
      }

      var logMeta = {
        name:    server.name,
        address: pkgcloud.compute.serverIp(server)
      };

      emitter.emit('create', server);
      self.emit(['server', 'create', 'success'], logMeta);
      self.emit(['server', 'wait'], logMeta);

      server.setWait({ status: 'RUNNING' }, 3000, function () {
        if (!run) {
          run = true;
          self.emit(['server', 'active'], logMeta);
          emitter.emit('active', server);
        }
      });
    });
  })();

  return emitter;
};

//
// ### @private function _tunnel(options)
// #### @options {Object} Options to create an SSH tunnel with
//
// Returns the necessary `ssh` CLI options to create a tunnel
// using the specified options:
//
// (required)
// * options.address:     Remote host to tunnel into
// * options.tunnel.host: Intermediary server to tunnel through
// * options.tunnel.port: Tunnel port for the specified `options.address`.
//
Bootstrapper.prototype._tunnel = function (argv, options) {
  var user = (
    (options.tunnel.user
      || options.remoteUser
      || this.remoteUser
      || 'root') + ''
  ).replace(/\W/g, '\\$&');

  return argv.concat([
    '-o', 'Port=22',
    '-o', 'User=' + user,
    '-o', 'HostName=' + options.address,
    '-o', 'ProxyCommand=ssh -o StrictHostKeyChecking=no ' + user + '@' + options.tunnel.host + ' nc %h %p 2> /dev/null'
  ]);
};

//
// ### @private function _scpOptions (options)
// #### @options {Object} Options to transform for scp
// Transforms the specified `options` into those which can be passed
// directly to `spawn('scp', ...)`.
//
Bootstrapper.prototype._scpOptions = function (options) {
  if (!options.keys || !options.target || !options.source) {
    //
    // Remark: Should we throw an error here?
    //
    return null;
  }

  var scpOptions = [
    '-i',
    options.keys['private'].path,
    '-q',
    '-o',
    'StrictHostKeyChecking=no',
    '-r'
  ];

  if (options.tunnel) {
    scpOptions = this._tunnel(scpOptions, options);
  }

  return scpOptions.concat([
    options.source,
    options.target
  ]);
};

//
// ### @private function _exec (command, options)
// #### @command {string} Command to execute
// #### @options {Object} Options to use when executing the command.
// Executes the `command` with the specified `options` logging the
// output to conservatory and emitting events along the way.
//
Bootstrapper.prototype._exec = function (command, options) {
  var self     = this,
      server   = options.server,
      address  = options.address || pkgcloud.compute.serverIp(options.server),
      emitter  = new events.EventEmitter(),
      exit     = options.exit || false,
      killed   = false,
      errs     = [],
      stdout   = '',
      stderr   = '',
      child;

  if (!address) {
    process.nextTick(function () {
      emitter.emit('error', new Error('Cannot run script without address'));
    });
    return emitter;
  }

  child = spawn(command, options.options);

  function onError(err) {
    self.emit(['run', command, 'error'], { error: err.message, address: address });
    errs.push(err);
  }

  function killChild() {
    if (!killed) {
      killed = true;
      child.kill();
    }
  }

  child.stderr.on('error', onError);
  child.stdout.on('error', onError);
  child.on('error', onError);

  child.stderr.on('data', function (chunk) {
    chunk = chunk.toString();
    stderr += chunk;

    chunk.split('\n').filter(Boolean).forEach(function (line) {
      self.emit(['run', command, 'stderr'], {
        address: address,
        data: line
      });
    });
  });

  child.stdout.on('data', function (chunk) {
    chunk = chunk.toString();
    stdout += chunk;

    chunk.split('\n').filter(Boolean).forEach(function (line) {
      self.emit(['run', command, 'stdout'], {
        address: address,
        data: line
      });
    });

    if (exit) {
      killChild();
    }
  });

  child.on('exit', function (code, signal) {
    self.emit(['run', command, 'end'], {
      code: code,
      signal: signal,
      address: address
    });

    //
    // If the target process didn't exit with code = 0
    // assume something went wrong.
    //
    if (code !== 0) {
      errs.push(new Error(command + ' exited unexpectedly with code: ' + code));
    }

    var anyErr = errs.length !== 0;
    if (anyErr) {
      return emitter.emit('error', errs);
    }

    self.emit(['run', command, 'success'], { address: address });
    emitter.emit('complete', options.server, stdout);
  });

  return emitter;
};

//
// ### @private function _sshPoll (options)
// #### @options {Object} Options to use when polling the server.
// #### @callback {function} Continuation to respond to.
// Polls server over ssh, trying to determine when server is actually up and
// active, ready to accept commands.
//
Bootstrapper.prototype._sshPoll = function (options, callback) {
  var interval   = options.pollInterval || 30 * 1000,
      maxRetries = options.pollMax      || 10,
      attempts   = 0,
      self = this;

  function poll() {
    var child = self.ssh({
      keys: options.keys,
      server: options.server,
      tunnel: options.tunnel,
      remoteUser: options.remoteUser,
      commands: ['true']
    });

    child.on('error', function () {
      ++attempts;
      if (++attempts >= maxRetries) {
        return callback(new Error('Server didn\'t become active in timely fashion'));
      }

      setTimeout(poll, interval);
    });

    child.on('complete', function () {
      return callback();
    });
  }

  poll();
};
