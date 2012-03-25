/*
 * bootstrapper.js: Core methods for bootstrapping servers in pkgcloud.
 *
 * (C) 2010, Nodejitsu Inc.
 *
 */

var fs = require('fs'),
    path = require('path'),
    exec = require('child_process').exec,
    spawn = require('child_process').spawn,
    async = require('async'),
    events = require('eventemitter2'),
    utile = require('utile'),
    pkgcloud = require('../../../pkgcloud');

//
// ### function Boostrapper (options)
// #### @options {Object} Options for this instance.
// ##### @compute {Object} Options for compute
// ###### @provider {String} Name of the provider
//
// Constructor function for the Bootstrapper object which contains
// base functionality for all bootstappers in conservatory.
//
var Bootstrapper = exports.Bootstrapper = function (options) {
  if (!options || !options.compute) {
    throw new Error('Missing required `options.compute`');
  }
  
  events.EventEmitter2.call(this, options);
  
  this.provider   = options.compute.provider || 'rackspace';
  this.keys       = options.keys;
  this.retryLimit = options.retryLimit || 3;
  this.remoteUser = options.remoteUser || 'root';

  //
  // Create a pkgcloud compute client with `options.compute` or
  // the stored configuration in `conservatory`.
  //
  this.compute = pkgcloud.compute.createClient(options.compute);
};

//
// Inherit from `EventEmitter2`
//
utile.inherits(Bootstrapper, events.EventEmitter2);

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
  function readKey (key, next) {
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

  async.forEach(this.keys, readKey, function (err) {
    return err ? callback(err) : callback(null, keyinfo);
  });
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
// * options.commands: Commands to run after server is created.
// * options.files:    Files to upload after server is created.
//
Bootstrapper.prototype.createServer = function (options) {
  var self    = this,
      emitter = new events.EventEmitter(),
      hasErr  = false,
      creator;

  //
  // Helper for handling errors
  //
  function onError (err) {
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

    creator = self._createServer(createOptions);
    creator.on('error', onError);
    creator.on('create', function (server) {
      emitter.emit('create', server);
    });

    creator.on('active', function (server) {
      emitter.emit('active', server);
      
      //
      // Helper function which uploads files of the form:
      //
      //    {
      //      remoteDir: '/remote/directory/to/upload/file/into',
      //      localFile: '/full/path/to/local/file'
      //    }
      //
      function uploadFile(file, next) {
        var uploadErr;
        
        self.uploadFile(file.remoteDir, file.localFile, server, keys)
          .on('error', function (err) {
            if (!uploadErr) {
              uploadErr = true;
              next(err);
            }
          })
          .on('complete', function () {
            if (!uploadErr) {
              next();
            }
          });
      }
      
      //
      // Now that the server is active upload any required files
      // and run the specified `options.commands`.
      //
      async.series([
        //
        // 1. Upload any required files. 
        //
        function uploadFiles(next) {
          return options.files
            ? async.forEach(files, uploadFile, next)
            : next();
        },
        //
        // 2. Bootstrap the server with the appropriate commands.
        //
        function bootstrap(next) {
          if (!options.commands) {
            return next();
          }
          
          self.ssh({
            commands: options.commands,
            keys: keys,
            server: server
          }, next);
        }
      ], function (err) {
        //
        // 3. Emit the approrpriate event depending if there is 
        //    an error or not.
        //
        return err 
          ? onError(err)
          : emitter.emit('complete', server);
      });
    });
  });

  return emitter;
};

//
// ### function downloadFile (dir, remoteFile, server)
// #### @dir {string} Directory to download the remote file to.
// #### @remoteFile {string} Full path of the remote file to download.
// #### @server {Object} Server to download the file from
// Downloads the `remoteFile` from the specified `server` into
// the local `dir`.
//
Bootstrapper.prototype.downloadFile = function (dir, remoteFile, server, keys) {
  return this.scp({
    keys: keys,
    server: server,
    download: true,
    source: remoteFile,
    target: path.join(dir, path.basename(remoteFile))
  });
};

//
// ### function uploadFile (dir, localFile, server)
// #### @dir {string} Directory to upload the local file to on the remote server.
// #### @localFile {string} Full path of the local file to upload.
// #### @server {Object} Server to upload the file to.
// Uploads the `localFile` to the `server` into the specified `dir`.
//
Bootstrapper.prototype.uploadFile = function (dir, localFile, server, keys) {
  return this.scp({
    keys: keys,
    server: server,
    upload: true,
    source: localFile,
    target: path.join(dir, path.basename(localFile))
  });
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
      address = options.address || server.addresses['public'][0];
      
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

    var commands = file.split('\n').concat(extra).filter(Boolean).join(' && '),
        runOptions,
        runner;
        
    runOptions = {
      address: options.address,
      commands: commands,
      keys: options.keys,
      server: server
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
        address: options.address || server.addresses['public'][0]
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
  var server     = options.server,
      address    = options.address || server.addresses['public'][0],
      scpOptions = this._scpOptions(options);

  this.emit(['run', 'scp', 'info'], {
    address: address,
    source: scpOptions.details.source,
    target: scpOptions.details.target,
    keyfile: path.basename(options.keys['private'])
  });

  return this._exec('scp', {
    server: options.server,
    exit: options.exit,
    options: scpOptions.commands
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
      address = options.address || server.addresses['public'][0];

  this.emit(['run', 'ssh', 'info'], {
    address: address,
    commands: options.commands,
    keyfile: path.basename(options.keys['private'])
  });

  return this._exec('ssh', {
    server: server,
    exit: options.exit,
    options: [
      '-i',
      options.keys['private'],
      '-q',
      '-o',
      'StrictHostKeyChecking no',
      '-o',
      'PasswordAuthentication no',
      [this.remoteUser, address].join('@'),
      options.commands
    ]
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

  (function tryAdd () {
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
        address: server.addresses['public'][0]
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
// ### @private function _scpOptions (options)
// #### @options {Object} Options to transform for scp
// Transforms the specified `options` into those which can be passed
// directly to `spawn('scp', ...)`.
//
Bootstrapper.prototype._scpOptions = function (options) {
  if (!options.server || !options.target || !options.source
    || (!options.download && !options.upload)) {
    //
    // Remark: Should we throw an error here?
    //
    return null;
  }

  var server = options.server,
      address = options.address || server.addresses['public'][0],
      details,
      scp;
      
  scp = [
    '-i',
    options.keys['private'],
    '-q',
    '-o',
    'StrictHostKeyChecking=no',
    '-r'
  ];

  if (options.download) {
    details = {
      source: this.remoteUser + '@' + 
        address + ':' + 
        options.source,
      target: options.target
    };
  }
  else if (options.upload) {
    details = {
      source: options.source,
      target: this.remoteUser + '@' + 
        address + ':' + 
        options.target
    };
  }

  return {
    commands: scp.concat([details.source, details.target]),
    details: details
  };
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
      address  = server.addresses['public'][0],
      emitter  = new events.EventEmitter(),
      exit     = options.exit || false,
      killed   = false,
      errs     = [],
      stdout   = '',
      stderr   = '',
      child;

  self.emit(['run', command, 'begin'], {
    address: address,
    keyfile: path.basename(options.keys['private']),
    options: options.options
  });

  child = spawn(command, options.options);

  function onError(err) {
    self.emit(['run', command, 'error'], { error: err.message, address: address });
    errs.push(err);
  }

  function killChild () {
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

    chunk.split('\n').forEach(function (line) {
      if (line.length > 0) {
        self.emit(['run', command, 'data'], { data: line });
      }
    });
  });

  child.stdout.on('data', function (chunk) {
    chunk = chunk.toString();
    stdout += chunk;

    chunk.split('\n').forEach(function (line) {
      if (line.length > 0) {
        self.emit(['run', command, 'data'], { 
          address: address,
          data: line
        });
      }
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
    // If the target process didn't exit with code = 0 and signal = null
    // assume something went wrong.
    //
    if (code !== 0 && signal !== null && signal !== 'SIGTERM') {
      errs.push(new Error(command + ' exited unexpectedly'));
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