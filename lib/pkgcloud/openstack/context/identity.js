/*
 * identity.js: Identity for openstack authentication
 *
 * (C) 2013 Rackspace, Ken Perkins
 * (C) 2015 IBM Corp.
 * MIT LICENSE
 *
 */

var _ = require('lodash'),
    events = require('eventemitter2'),
    request = require('request'),
    ServiceCatalog = require('./serviceCatalog').ServiceCatalog,
    urlJoin = require('url-join'),
    util = require('util'),
    pkgcloud = require('../../../pkgcloud');

// TODO refactor failCodes, getError into global handlers
var failCodes = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Resize not allowed',
  404: 'Item not found',
  405: 'Bad Method',
  409: 'Build in progress',
  413: 'Over Limit',
  415: 'Bad Media Type',
  500: 'Fault',
  503: 'Service Unavailable'
};

function getError(err, res, body) {
  if (err) {
    return err;
  }

  var statusCode = res.statusCode.toString(),
    err2;

  if (Object.keys(failCodes).indexOf(statusCode) !== -1) {
    //
    // TODO: Support more than JSON errors here
    //
    err2 = {
      failCode: failCodes[statusCode],
      statusCode: res.statusCode,
      message: 'Error (' +
        statusCode + '): ' + failCodes[statusCode],
      href: res.request.uri.href,
      method: res.request.method,
      headers: res.headers
    };

    try {
      err2.result = typeof body === 'string' ? JSON.parse(body) : body;
    } catch (e) {
      err2.result = { err: body };
    }

    return err2;
  }
}

/**
 * Identity object
 *
 * @description Base Identity object for Openstack Keystone
 *
 * @param options
 * @constructor
 */
var Identity = exports.Identity = function (options) {
  var self = this;

  events.EventEmitter2.call(this, { delimiter: '::', wildcard: true });

  self.options = options || {};
  self.name = 'OpenstackIdentity';
  self.basePath = options.basePath || (options.keystoneAuthVersion === 'v3' ? '/v3/auth/tokens' : '/v2.0/tokens');
  self.useServiceCatalog = (typeof options.useServiceCatalog === 'boolean')
    ? options.useServiceCatalog
    : true;

  _.each(['url'], function (value) {
    if (!self.options[value]) {
      throw new Error('options.' + value + ' is a required option');
    }
  });
};

util.inherits(Identity, events.EventEmitter2);

/**
 * Identity.authorize
 *
 * @description this function is the guts of authorizing against an openstack
 * identity endpoint.
 * @param {object}  options   the options for authorization
 * @param callback
 */
Identity.prototype.authorize = function (options, callback) {
  var self = this;

  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  var authenticationOptions = {
    uri: urlJoin(options.url || self.options.url, self.basePath),
    method: 'POST',
    strictSSL: options.strictSSL || self.options.strictSSL,
    headers: {
      'User-Agent': util.format('nodejs-pkgcloud/%s', pkgcloud.version),
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  };
  if (self.options.headers) {
    for (var header in self.options.headers) {
      if (self.options.headers.hasOwnProperty(header)) {
          authenticationOptions.headers[header] = self.options.headers[header];
      }
    }
  }

  if (self.options.version === 1 || self.options.version === '/v1.0') {
    authenticationOptions.uri = urlJoin(options.url || self.options.url, '/auth/v1.0');
    authenticationOptions.method = 'GET';
    authenticationOptions.headers['X-Auth-User'] = self.options.username;
    authenticationOptions.headers['X-Auth-Key'] = self.options.password;
  }
  self._buildAuthenticationPayload();

  // we can't be called without a payload
  if (!self._authenticationPayload) {
    return process.nextTick(function () {
      callback(new Error('Unable to authorize; missing required inputs'));
    });
  }

  // Are we filtering down by a tenant?
  if (self.options.tenantId) {
    self._authenticationPayload.auth.tenantId = self.options.tenantId;
  }
  else if (self.options.tenantName) {
    self._authenticationPayload.auth.tenantName = self.options.tenantName;
  }

  authenticationOptions.json = self._authenticationPayload;

  self.emit('log::trace', 'Sending client authorization request', authenticationOptions);

  // Don't keep a copy of the credentials in memory
  delete self._authenticationPayload;
  request(authenticationOptions, function (err, response, body) {
    // check for a network error, or a handled error
    var err2 = getError(err, response, body);

    if (err2) {
      return callback(err2);
    }

    self.emit('log::trace', 'Provider Authentication Response', {
      href: response.request.uri.href,
      method: response.request.method,
      headers: response.headers,
      statusCode: response.statusCode
    });

    // If we've been asked to do v1 auth, check the response headers
    // otherwise, check the body
    try {
      if (self.options.version === 1 || self.options.version === '/v1.0') {
        self._storageUrl = response.headers['x-storage-url'];
        self.token = {
          id: response.headers['x-auth-token']
        };
        callback();
      }
      // If we don't have a tenantId in the response (meaning no service catalog)
      // go ahead and make a 1-off request to get a tenant and then reauthorize
      else if (self.options.keystoneAuthVersion !== 'v3' && !body.access.token.tenant) {
        getTenantId(urlJoin(options.url || self.options.url, '/v2.0/tenants'), body.access.token.id);
      }
      else {
        self._parseIdentityResponse(body, response.headers);
        callback();
      }
    }
    catch (e) {
      callback(e);
    }
  });

  function getTenantId(endpoint, token) {
    var tenantOptions = {
      uri: endpoint,
      json: true,
      strictSSL: options.strictSSL || self.options.strictSSL,
      headers: {
        'X-Auth-Token': token,
        'Content-Type': 'application/json',
        'User-Agent': util.format('nodejs-pkgcloud/%s', pkgcloud.version)
      }
    };

    request(tenantOptions, function (err, response, body) {
      if (err || !body.tenants || !body.tenants.length) {
        return callback(err ? err : new Error('Unable to find tenants'));
      }

      var firstActiveTenant;
      body.tenants.forEach(function (tenant) {
        if (!firstActiveTenant && !!tenant.enabled && tenant.enabled !== 'false') {
          firstActiveTenant = tenant;
        }
      });

      if (!firstActiveTenant) {
        return callback(new Error('Unable to find an active tenant'));
      }

      // TODO make this more resiliant (what if multiple active tenants)
      self.options.tenantId = firstActiveTenant.id;
      self.authorize(options, callback);
    });
  }
};

/**
 * Identity._buildAuthenticationPayload
 *
 * @description processes the authentication options into a valid payload for
 * authorization
 *
 * @private
 */
Identity.prototype._buildAuthenticationPayload = function () {
  var self = this;

  self.emit('log::trace', 'Building Openstack Identity Auth Payload');
  if (self.options.keystoneAuthVersion === 'v3') {
    if (self.options.password) {
      self._authenticationPayload = {
        auth: {
          identity : {
            methods : ['password'],
            password : {
              user: {
                password: self.options.password
              }
            }
          }
        }
      };

      //first add user name or id to user field
      if (self.options.username) {
        self._authenticationPayload.auth.identity.password.user.name = self.options.username;
      } else if (self.options.userid) {
        self._authenticationPayload.auth.identity.password.user.id = self.options.userid;
      }
      //check if authenticating against user domain
      if (self.options.domainId) {
        self._authenticationPayload.auth.identity.password.user.domain = {id:self.options.domainId};
      } else if (self.options.domainName) {
        self._authenticationPayload.auth.identity.password.user.domain = {name:self.options.domainName};
      }
      //check if we're getting a scoped token against a project and/or domain
      if (self.options.tenantId || self.options.tenantName || self.options.projectDomainName || self.options.projectDomainId) {
        self._authenticationPayload.auth.scope = {};
        var scopedProject = true;
        if (self.options.tenantId) {
          self._authenticationPayload.auth.scope.project = {id:self.options.tenantId};
        } else  if (self.options.tenantName) {
          self._authenticationPayload.auth.scope.project = {name:self.options.tenantName};
        } else {
          scopedProject = false;
        }
        if (!scopedProject) {
          if (self.options.projectDomainId) {
            self._authenticationPayload.auth.scope.domain = {id:self.options.projectDomainId};
          } else if (self.options.projectDomainName) {
            self._authenticationPayload.auth.scope.domain = {name:self.options.projectDomainName};
          }
        } else {
          if (self.options.projectDomainId) {
            self._authenticationPayload.auth.scope.project.domain = {id:self.options.projectDomainId};
          } else if(self.options.projectDomainName) {
            self._authenticationPayload.auth.scope.project.domain = {name:self.options.projectDomainName};
          }
        }
      }
    }
    // Token and tenant are also valid inputs
    else if (self.options.token && (self.options.tenantId || self.options.tenantName)) {
      self._authenticationPayload = {
        auth: {
          identity : {
            methods : ['token'],
            token: {
              id: self.options.token
            }
          }
        }
      };
    }
  } else {
    // setup our inputs for authorization
    if (self.options.password && self.options.username) {
      self._authenticationPayload = {
        auth: {
          passwordCredentials: {
            username: self.options.username,
            password: self.options.password
          }
        }
      };
    }
    // Token and tenant are also valid inputs
    else if (self.options.token && (self.options.tenantId || self.options.tenantName)) {
      self._authenticationPayload = {
        auth: {
          token: {
            id: self.options.token
          }
        }
      };
    }
    // Are we filtering down by a tenant?
    if (self._authenticationPayload && self.options.tenantId) {
      self._authenticationPayload.auth.tenantId = self.options.tenantId;
    }
    else if (self._authenticationPayload && self.options.tenantName) {
      self._authenticationPayload.auth.tenantName = self.options.tenantName;
    }
  }
};

/**
 * Identity._parseIdentityResponse
 *
 * @description takes the full identity response and deserializes it into a
 * serviceCatalog object with services.
 *
 * @param {object}    data      the raw response from the identity call
 * @private
 */
Identity.prototype._parseIdentityResponse = function (data, headers) {
  var self = this;

  if (!data) {
    throw new Error('missing required arguments!');
  }
  if (self.options.keystoneAuthVersion === 'v3') {
    self.token = {
      id: headers['x-subject-token'],
      expires: new Date(data.token.expires_at),
      issued_at: new Date(data.token.issued_at),
      tenant: {id: data.token.project.id, name: data.token.project.name}
    };
    self.user = data.token.user;
    if (self.useServiceCatalog) {
      self.serviceCatalog = new ServiceCatalog(data.token.catalog);
    }
  } else {
    if (data.access.token) {
      self.token = data.access.token;
      self.token.expires = new Date(self.token.expires);
    }

    if (self.useServiceCatalog && data.access.serviceCatalog) {
      self.serviceCatalog = new ServiceCatalog(data.access.serviceCatalog);
    }

    self.user = data.access.user;
  }
  self.raw = data;
};

Identity.prototype.getServiceEndpointUrl = function (options) {
  if (this.useServiceCatalog) {
    return this.serviceCatalog.getServiceEndpointUrl(options);
  }
  // This is a hack to enable support for v1 swift clients
  // TODO move all auth for v1 swift out of identity, as it's not related to identity at all
  else if (this.options.version === 1 || this.options.version === '/v1.0') {
    return this._storageUrl;
  }
  else {
    return this.options.url;
  }
};



