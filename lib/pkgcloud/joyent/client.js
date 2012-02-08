/*
 * client.js: Base client from which all Joyent clients inherit from
 *
 * (C) 2012 Nodejitsu Inc.
 *
 */

var utile    = require('utile'),
    smartdc  = require('smartdc'),
    fs       = require('fs'),
    base     = require('../core/base');


function loadSigningKey(parsed, callback) {
  fs.readFile(parsed.identity, 'ascii', function(err, file) {
    if (err) { callback(err); }
    parsed.signingKey = file;
    return callback(null,parsed);
  });
}
// end of joyents code

var Client = exports.Client = function (options) {
  base.Client.call(this, options);

  this.serversUrl = options.serversUrl 
                 || process.env.SDC_CLI_URL || 'api.joyentcloud.com';

  options.url     = 'https://' + this.serversUrl;
  this.provider   = 'joyent';
  
  if (!options.identity) {
    options.identity = process.env.SDC_CLI_IDENTITY 
                    || process.env.HOME + '/.ssh/id_rsa';
  }

  if(!options.account) {
    if(process.env.SDC_CLI_ACCOUNT)
      options.account = process.env.SDC_CLI_ACCOUNT;
    else
      throw new Error('Please specify your account');
  }

  if (!options.keyId) {
    options.keyId = '/' + options.account + '/keys/' + 
      (process.env.SDC_CLI_KEY_ID || 'id_rsa');
  }

  // try to get the signingKey
  try { options.key = fs.readFileSync(options.identity, 'ascii'); }
  // if it failed try basic auth
  catch (e) { console.log(e); delete options.identity; delete options.keyId; }
console.log(options)
  this.client     = smartdc.createClient(options);
};

utile.inherits(Client, base.Client);