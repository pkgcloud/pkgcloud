/*
 * loadbalancers.js: Rackspace loadbalancer client loadBalancers functionality
 *
 * (C) 2013 Rackspace
 *      Ken Perkins
 * MIT LICENSE
 *
 */

/**
 * @module loadbalancers
 */

var base = require('../../../core/dns'),
    urlJoin = require('url-join'),
    pkgcloud = require('../../../../../lib/pkgcloud'),
    errs = require('errs'),
    _ = require('underscore'),
    lb = pkgcloud.providers.rackspace.loadbalancer;

var _urlPrefix = 'loadbalancers';

module.exports = {

  /**
   * client.getLoadBalancers
   * @function
   *
   * @description Get a list of all Load Balancers
   *
   * @param {object|Function}     options     Not used presently
   * @param {Function}            callback ( error, loadBalancers )
   */
  getLoadBalancers: function (options, callback) {
    var self = this,
        requestOptions = {
          path: _urlPrefix
    };

    if (typeof options === 'function') {
      callback = options;
      options = {};
    }

    self._request(requestOptions, function (err, body, res) {
      if (err) {
        return callback(err);
      }

      else if (!body || !body.loadBalancers) {
        return callback(new Error('Unexpected empty response'));
      }

      else {
        return callback(null, body.loadBalancers.map(function (loadBalancer) {
          return new lb.LoadBalancer(self, loadBalancer);
        }));
      }
    });
  },

  /**
   * client.getLoadBalancer
   * @function
   *
   * @description Get the details for a specific Load Balancer
   *
   * @param {object|String}   loadBalancer  The ID or instance of the Load Balancer
   * @param {Function}        callback ( error, loadBalancer )
   */
  getLoadBalancer: function(loadBalancer, callback) {
    var self = this,
        loadBalancerId =
          loadBalancer instanceof lb.LoadBalancer ? loadBalancer.id : loadBalancer;

    self._request({
      path: urlJoin(_urlPrefix, loadBalancerId)
    }, function (err, body, res) {
      if (err) {
        return callback(err);
      }

      else if (!body || !body.loadBalancer) {
        return callback(new Error('Unexpected empty response'));
      }

      else {
        return callback(null, new lb.LoadBalancer(self, body.loadBalancer));
      }
    });
  },

  /**
   * client.createLoadBalancer
   * @function
   *
   * @description Create a new cloud LoadBalancer. There are a number of options for
   * cloud load balancers; please reference the Rackspace API documentation for more
   * insight into the specific parameter values:
   *
   * @link http://docs.rackspace.com/loadbalancers/api/v1.0/clb-devguide/content/Overview-d1e82.html 
   *
   * @param {object}            details   
   * @param {String}            details.name                    The name of the Load Balancer
   *
   * @param {Object}            details.protocol
   * @param {String}            [details.protocol.name]         Protocol name
   * @param {Number}            [details.protocol.port]         Port number
   *
   * @param {object}            details.virtualIps              Array of virtualIps for new LB (Limit 10)
   * @param {String}            details.virtualIps.ipVersion    IP Version: Must be 'IPV6'
   * @param {String}            details.virtualIps.type         Typeof VIP to add ( 'PUBLIC' or 'SERVICENET' )
   *
   * @param {String[]}          [details.nodes]                 Array of Node IDs to add
   *
   * @param {object}            [details.accessList]            Access List for VIP - See API docs
   * @param {String}            [details.algorithm=RANDOM]      Algorithm used to route traffic
   * @param {String}            [details.connectionLogging]     Connection logging enabled ('true' or 'false')
   * @param {object}            [details.connectionThrottle]    Set limits on number of connections per IP - See API docs
   * @param {object}            [details.healthMonitor]         Configure a health monitor - See API docs
   * @param {object}            [details.metadata]              Setup LB metadata - See API docs
   * @param {Integer}           [details.timeout=30]            Set LB timeout (Max 120)
   * @param {String}            [details.sessionPersistence]    Set session persistence mod ('HTTP_COOKIE' or 'SOURCE_IP'
   *
   * @param {function}          callback ( error, loadBalancer )
   */
  createLoadBalancer: function(details, callback) {
    var self = this,
        createOptions = {
          path: _urlPrefix,
          method: 'POST',
          body: {
            name: details.name,
            nodes: details.nodes || [],
            protocol: details.protocol ? details.protocol.name : '',
            port: details.protocol ? details.protocol.port : '',
            virtualIps: details.virtualIps
          }
        };

    createOptions.body = _.extend(createOptions.body,
      _.pick(details, ['accessList', 'algorithm', 'connectionLogging',
        'connectionThrottle', 'healthMonitor', 'metadata', 'timeout',
        'sessionPersistence']));

    var validationErrors = validateLbInputs(createOptions.body);

    if (validationErrors) {
      return callback(new Error('Errors validating inputs for createLoadBalancer', validationErrors));
    }

    self._request(createOptions, function(err, body) {
      return err
        ? callback(err)
        : callback(err, new lb.LoadBalancer(self, body.loadBalancer));
    });
  },

  /**
   * client.updateLoadBalancer
   * @function
   * @description Update specific parameters of a cloud LoadBalancer. There are a number of options for
   * cloud load balancers; please reference the Rackspace API documentation for more
   * insight into the specific parameter values:
   *
   * @link http://docs.rackspace.com/loadbalancers/api/v1.0/clb-devguide/content/Overview-d1e82.html 
   *
   * Specific properties updated: name, protocol, port, timeout,
   * algorithm, httpsRedirect and halfClosed
   *
   * @param {object}            loadBalancer
   * @param {String}            loadBalancer.id                      The ID of the Load Balancer to update
   * @param {String}            [loadBalancer.name]                  The new name of the Load Balancer
   * @param {String}            [loadBalancer.protocol]              New protocol name
   * @param {Number}            [loadBalancer.port]                  New port number
   * @param {Integer}           [loadBalancer.timeout=30]            Set LB timeout (Max 120)
   * @param {String}            [loadBalancer.algorithm]             Algorithm used to route traffic
   * @param {function}      callback
   */
  updateLoadBalancer: function (loadBalancer, callback) {

    if (!(loadBalancer instanceof lb.LoadBalancer)) {
      throw new Error('Missing required argument: loadBalancer');
    }

    var self = this,
      updateOptions = {
        path: urlJoin(_urlPrefix, loadBalancer.id),
        method: 'PUT',
        body:  {}
      };

    updateOptions.body.loadBalancer = _.pick(loadBalancer, ['name', 'protocol',
      'port', 'timeout', 'algorithm', 'httpsRedirect', 'halfClosed']);

    self._request(updateOptions, function (err) {
      callback(err);
    });
  },

  /**
   * client.deleteLoadBalancer
   * @function
   *
   * @description Deletes the provided Load Balancer and all configuration information
   *
   * @param {object|String}     loadBalancer    The ID or instance of the Load Balancer
   * @param {Function}          callback ( error )
   */
  deleteLoadBalancer: function(loadBalancer, callback) {
    var self = this,
        loadBalancerId =
          loadBalancer instanceof lb.LoadBalancer ? loadBalancer.id : loadBalancer;

    self._request({
      path: urlJoin(_urlPrefix, loadBalancerId),
      method: 'DELETE'
    }, function (err) {
      callback(err);
    });
  },

  /// Virtual IP Functionality

  /**
   * client.getVirtualIps
   * @function
   *
   * @description Get the list of virtualIps for the provided Load Balancer
   *
   * @param {object|String}     loadBalancer      The ID or instance of the Load Balancer
   * @param {function}          callback ( error, virtualIps )
   */
  getVirtualIps: function (loadBalancer, callback) {
    var self = this,
      loadBalancerId =
        loadBalancer instanceof lb.LoadBalancer ? loadBalancer.id : loadBalancer;

    self._request({
      path: urlJoin(_urlPrefix, loadBalancerId, 'virtualips')
    }, function (err, body) {
      return callback(err, body.virtualIps);
    });
  },

  /**
   * client.addIPV6VirtualIp
   * @function
   *
   * @description Add a public facing IPV6 virtualIP to your load balancer
   *
   * @param {object|String}     loadBalancer      The ID or instance of the Load Balancer
   * @param {function}          callback ( error, response )
   */
  addIPV6VirtualIp: function (loadBalancer, callback) {
    var self = this,
      loadBalancerId =
        loadBalancer instanceof lb.LoadBalancer ? loadBalancer.id : loadBalancer;

    self._request({
      path: urlJoin(_urlPrefix, loadBalancerId, 'virtualips'),
      method: 'POST',
      body: {
        ipVersion: 'IPV6',
        type: 'PUBLIC'
      }
    }, function (err, body) {
      return callback(err, body);
    });
  },

  /**
   * client.removeVirtualIp
   * @function
   *
   * @description Remove a virtualIP from a load Balancer
   *
   * @param {object|String}     loadBalancer      The ID or instance of the Load Balancer
   * @param {String}            virtualIp         The virtualIp ID to remove
   * @param {function}          callback ( error )
   */
  removeVirtualIp: function (loadBalancer, virtualIp, callback) {
    var self = this,
      loadBalancerId =
        loadBalancer instanceof lb.LoadBalancer ? loadBalancer.id : loadBalancer;

    self._request({
      path: urlJoin(_urlPrefix, loadBalancerId, 'virtualips', virtualIp),
      method: 'DELETE'
    }, function (err) {
      return callback(err);
    });
  },

  /// SSL Termination

  /**
   * client.getSSLConfig
   * @function
   *
   * @description Gets the current SSL termination config, if any
   *
   * @param {object|String}     loadBalancer      The ID or instance of the Load Balancer
   * @param {function}          callback ( error, sslTermination )
   */
  getSSLConfig: function(loadBalancer, callback) {
    var self = this,
        loadBalancerId =
          loadBalancer instanceof lb.LoadBalancer ? loadBalancer.id : loadBalancer;

    self._request({
      path: urlJoin(_urlPrefix, loadBalancerId, 'ssltermination')
    }, function (err, body) {
      return err
        ? callback(err)
        : callback(err, body.sslTermination);
    });
  },

  /**
   * client.updateSSLConfig
   * @function
   *
   * @description Update the SSL configuration for a Load Balancer
   *
   * @param {object|String}     loadBalancer                            The ID or instance of the Load Balancer
   * @param {Object}            details                                 
   * @param {Boolean}           details.enabled=true                    Enable/disable SSL
   * @param {Integer}           details.securePort                      Port number for the SSL service
   * @param {String}            details.privatekey                      Keyfile contents for the certificate
   * @param {String}            details.certificate                     The certificate contents to load
   * @param {Boolean}           [details.secureTrafficOnly=false]       Enable/disable SSL traffic only
   * @param {String}            [details.intermediatecertificate]       The intermediate certificate contents
   * @param {function}          callback ( error )
   */
  updateSSLConfig: function(loadBalancer, details, callback) {
    var self = this,
        loadBalancerId =
          loadBalancer instanceof lb.LoadBalancer ? loadBalancer.id : loadBalancer;

    var options = _.pick(details, ['securePort', 'privatekey', 'certificate',
      'intermediateCertificate', 'enabled', 'secureTrafficOnly']);

    self._request({
      path: urlJoin(_urlPrefix, loadBalancerId, 'ssltermination'),
      method: 'PUT',
      body: options
    }, function (err) {
      callback(err);
    });
  },

  /**
   * client.removeSSLConfig
   * @function
   *
   * @description Removes and disables SSL termination
   *
   * @param {object|String}     loadBalancer      The ID or instance of the Load Balancer
   * @param {function}          callback ( error )
   */
  removeSSLConfig: function (loadBalancer, callback) {
    var self = this,
        loadBalancerId =
          loadBalancer instanceof lb.LoadBalancer ? loadBalancer.id : loadBalancer;

    self._request({
      path: urlJoin(_urlPrefix, loadBalancerId, 'ssltermination'),
      method: 'DELETE'
    }, function (err, body, res) {
      callback(err);
    });
  },

  /// Access Control Functionality

  /**
   * client.getAccessList
   * @function
   *
   * @description Get the access control list for the provided LoadBbalancer
   *
   * @param {object|String}     loadBalancer      The ID or instance of the Load Balancer
   * @param {function}          callback ( error, accessList )
   */
  getAccessList: function(loadBalancer, callback) {
    var self = this,
        loadBalancerId =
          loadBalancer instanceof lb.LoadBalancer ? loadBalancer.id : loadBalancer;

    self._request({
      path: urlJoin(_urlPrefix, loadBalancerId, 'accesslist')
    }, function (err, body, res) {
      return callback(err, body.accessList);
    });
  },

  /**
   * client.addAccessList
   * @function
   *
   * @description Add an entry or array of entries to the Load Balancer accessList
   *
   * Sample Access List Entry:
   *
   * {
   *    address: '192.168.0.1',
   *    type: 'ALLOW' // optionally use 'DENY'
   * }
   * @link http://docs.rackspace.com/loadbalancers/api/v1.0/clb-devguide/content/Overview-d1e82.html 
   *
   * @param {object|String}     loadBalancer      The ID or instance of the Load Balancer
   * @param {object|Array}      accessList        An object or array of access controls to add
   * @param {function}          callback  ( error )
   *
   *
   */
  addAccessList: function(loadBalancer, accessList, callback) {
    var self = this,
        loadBalancerId =
          loadBalancer instanceof lb.LoadBalancer ? loadBalancer.id : loadBalancer;

    if (!Array.isArray(accessList)) {
      accessList = [ accessList ];
    }

    self._request({
      path: urlJoin(_urlPrefix, loadBalancerId, 'accesslist'),
      method: 'POST',
      body: {
        accessList: accessList
      }
    }, function (err) {
      return callback(err);
    });
  },

  /**
   * client.deleteAccessListItem
   * @function
   *
   * @description Remove an entry from a Load Balancer accessList
   *
   * @param {object|String}     loadBalancer      The ID or instance of the Load Balancer
   * @param {Object|Number}     accessListItem    An object or the ID of the access list to remove 
   * @param {function}          callback ( error )
   */
  deleteAccessListItem: function(loadBalancer, accessListItem, callback) {
    var self = this,
        loadBalancerId =
          loadBalancer instanceof lb.LoadBalancer ? loadBalancer.id : loadBalancer,
        accessListItemId = (typeof accessListItem === 'object')
          ? accessListItem.id : accessListItem;

    self._request({
      path: urlJoin(_urlPrefix, loadBalancerId, 'accesslist', accessListItemId),
      method: 'DELETE'
    }, function (err) {
      return callback(err);
    });
  },

  /**
   * client.deleteAccessList
   * @function
   *
   * @description Remove an array of objects from a LoadBalancer accessList
   *
   * @param {object|String}             loadBalancer      The ID or instance of the Load Balancer
   * @param {object[]|String[]}         accessList        An array of objects or the IDs to remove
   * @param {function}                  callback ( error )
   */
  deleteAccessList: function(loadBalancer, accessList, callback) {
    var self = this,
        loadBalancerId =
          loadBalancer instanceof lb.LoadBalancer ? loadBalancer.id : loadBalancer;

    // check for valid inputs
    if (!accessList || accessList.length === 0 || !Array.isArray(accessList)) {
      throw new Error('accessList must be an array of accessList or accessListId');
    }

    // support passing either the javascript object or an array of ids
    var list = accessList.map(function(item) {
      return (typeof item === 'object') ? item.id : item;
    });

    self._request({
      path: urlJoin(_urlPrefix, loadBalancerId, 'accesslist', '?id=' + list.join('&id=')),
      method: 'DELETE'
    }, function (err, body, res) {
      return callback(err);
    });
  },

  /**
   * client.resetAccessList
   * @function
   *
   * @description Completely delete and reset the access list
   *
   * @param {object|String}     loadBalancer      The ID or instance of the Load Balancer
   * @param {function}          callback ( error )
   */
  resetAccessList: function (loadBalancer, callback) {
    var self = this,
        loadBalancerId =
          loadBalancer instanceof lb.LoadBalancer ? loadBalancer.id : loadBalancer;

    self._request({
      path: urlJoin(_urlPrefix, loadBalancerId, 'accesslist'),
      method: 'DELETE'
    }, function (err) {
      return callback(err);
    });
  },

  /// Health Monitor Functionality

  /**
   * client.getHealthMonitor
   * @function
   *
   * @description Get the current health monitor configuration for a Load Balancer
   *
   * @param {object|String}     loadBalancer      The ID or instance of the Load Balancer
   * @param {function}          callback ( healthMonitor )
   */
  getHealthMonitor: function(loadBalancer, callback) {
    var self = this,
        loadBalancerId =
          loadBalancer instanceof lb.LoadBalancer ? loadBalancer.id : loadBalancer;

    self._request({
      path: urlJoin(_urlPrefix, loadBalancerId, 'healthmonitor')
    }, function (err, body) {
      return callback(err, body.healthMonitor);
    });
  },

  /**
   * client.updateHealthMonitor
   * @function
   *
   * @description Get the current health monitor configuration for a Load Balancer.
   *
   * There are two kinds of connection monitors you can enable, CONNECT and HTTP/HTTPS.
   * CONNECT monitors are basically a ping check. HTTP/HTTPS checks
   * are used to validate an HTTP request body/status for specific information.
   *
   * Sample CONNECT details:
   *
   * {
   *    type: 'CONNECT',
   *    delay: 10,
   *    timeout: 10,
   *    attemptsBeforeDeactivation: 3
   * }
   * 
   * Sample HTTP details:
   * 
   * {
   *    type: 'HTTP',
   *    delay: 10,
   *    timeout: 10,
   *    attemptsBeforeDeactivation: 3,
   *    path: '/',
   *    statusRegex: '^[234][0-9][0-9]$',
   *    bodyRegex: '^[234][0-9][0-9]$',
   *    hostHeader: 'myrack.com'
   *  }
   *
   * @link http://docs.rackspace.com/loadbalancers/api/v1.0/clb-devguide/content/Overview-d1e82.html 
   *
   * @param {object|String}     loadBalancer            The ID or instance of the Load Balancer
   * @param {Object}            details
   * @param {String}            details.type            The type of Health Monitor ('CONNECT' or 'HTTP') 
   * @param {String}            details.other_options   See API Docs and Examples above for directives appropriate to each Health Monitor type
   * @param {function}          callback ( error )
   *
   */
  updateHealthMonitor: function(loadBalancer, details, callback) {
    var self = this,
        loadBalancerId =
          loadBalancer instanceof lb.LoadBalancer ? loadBalancer.id : loadBalancer;

    if (!details || !details.type) {
      throw new Error('Details is a required option for loadBalancer health monitors');
    }

    var requestOptions = {
      path: urlJoin(_urlPrefix, loadBalancerId, 'healthmonitor'),
      method: 'PUT'
    };

    if (details.type === 'CONNECT') {
      requestOptions.body = {
        attemptsBeforeDeactivation: details.attemptsBeforeDeactivation,
        type: details.type,
        delay: details.delay,
        timeout: details.timeout
      }
    }
    else if (details.type === 'HTTP' || details.type === 'HTTPS') {
      requestOptions.body = {
        attemptsBeforeDeactivation: details.attemptsBeforeDeactivation,
        type: details.type,
        delay: details.delay,
        timeout: details.timeout,
        bodyRegex: details.bodyRegex,
        path: details.path,
        statusRegex: details.statusRegex
      }

      if (details.hostHeader) {
        requestOptions.body.hostHeader = details.hostHeader;
      }
    }
    else {
      throw new Error('Unsupported health monitor type');
    }

    self._request(requestOptions, function (err) {
      return callback(err);
    });
  },

  /**
   * client.removeHealthMonitor
   * @function
   *
   * @description Remove and disable any health monitors
   *
   * @param {object|String}     loadBalancer      The ID or instance of the Load Balancer
   * @param {function}          callback ( error )
   */
  removeHealthMonitor: function(loadBalancer, callback) {
    var self = this,
        loadBalancerId =
          loadBalancer instanceof lb.LoadBalancer ? loadBalancer.id : loadBalancer;

    self._request({
      path: urlJoin(_urlPrefix, loadBalancerId, 'healthmonitor'),
      method: 'DELETE'
    }, function (err) {
      return callback(err);
    });
  },

  /// Session Persistence Functionality

  /**
   * client.getSessionPersistence
   * @function
   *
   * @description Get the session persistence settings for the provided Load Balancer
   *
   * @param {object|String}     loadBalancer      The ID or instance of the Load Balancer
   * @param {function}          callback ( error, sessionPersistence )
   */
  getSessionPersistence: function (loadBalancer, callback) {
    var self = this,
        loadBalancerId =
          loadBalancer instanceof lb.LoadBalancer ? loadBalancer.id : loadBalancer;

    self._request({
      path: urlJoin(_urlPrefix, loadBalancerId, 'sessionpersistence')
    }, function (err, body) {
      return callback(err, body.sessionPersistence);
    });
  },

  /**
   * client.enableSessionPersistence
   * @function
   *
   * @description Enable session persistence of the requested type
   *
   * @param {object|String}     loadBalancer      The ID or instance of the Load Balancer
   * @param {String}            type              HTTP_COOKIE or SOURCE_IP
   * @param {function}          callback ( error )
   */
  enableSessionPersistence: function (loadBalancer, type, callback) {
    var self = this,
        loadBalancerId =
          loadBalancer instanceof lb.LoadBalancer ? loadBalancer.id : loadBalancer;

    if (!type || (type !== 'HTTP_COOKIE' && type !== 'SOURCE_IP')) {
      throw new Error('Please provide a valid session persistence type');
    }

    self._request({
      path: urlJoin(_urlPrefix, loadBalancerId, 'sessionpersistence'),
      method: 'PUT',
      body: {
        sessionPersistence: {
          persistenceType: type
        }
      }
    }, function (err) {
      return callback(err);
    });
  },

  /**
   * client.disableSessionPersistence
   * @function
   *
   * @description Disable session persistence for the provided Load Balancer
   *
   * @param {object|String}     loadBalancer      The ID or instance of the Load Balancer
   * @param {function}          callback ( error )
   */
  disableSessionPersistence: function (loadBalancer, callback) {
    var self = this,
        loadBalancerId =
          loadBalancer instanceof lb.LoadBalancer ? loadBalancer.id : loadBalancer;

    self._request({
      path: urlJoin(_urlPrefix, loadBalancerId, 'sessionpersistence'),
      method: 'DELETE'
    }, function (err) {
      return callback(err);
    });
  },

  /// Connection Logging Functionality

  /**
   * client.getConnectionLoggingConfig
   * @function
   *
   * @description Get the current connection logging configuration for the provided Load Balancer
   *
   * @param {object|String}     loadBalancer      The ID or instance of the Load Balancer
   * @param {function}          callback ( error, connectionLogging )
   */
  getConnectionLoggingConfig: function(loadBalancer, callback) {
    var self = this,
        loadBalancerId =
          loadBalancer instanceof lb.LoadBalancer ? loadBalancer.id : loadBalancer;

    self._request({
      path: urlJoin(_urlPrefix, loadBalancerId, 'connectionlogging')
    }, function (err, body) {
      return callback(err, body.connectionLogging);
    });
  },

  /**
   * client.updateConnectionLogging
   * @function
   *
   * @description Enable or disable connection logging for the provided Load Balancer
   *
   * @param {object|String}     loadBalancer      The ID or instance of the Load Balancer
   * @param {Boolean}           enabled           Enable or disable logging
   * @param {function}          callback ( error )
   */
  updateConnectionLogging: function(loadBalancer, enabled, callback) {
    var self = this,
        loadBalancerId =
          loadBalancer instanceof lb.LoadBalancer ? loadBalancer.id : loadBalancer;

    if (typeof enabled !== 'boolean') {
      throw new Error('enabled must be a boolean value');
    }

    self._request({
      path: urlJoin(_urlPrefix, loadBalancerId, 'connectionlogging'),
      method: 'PUT',
      body: {
        connectionLogging: {
          enabled: enabled
        }
      }
    }, function (err) {
      return callback(err);
    });
  },

  /// Connection Throttle Functionality

  /**
   * client.getConnectionThrottleConfig
   * @function
   *
   * @description Get the current connection logging throttle configuration for the provided Load Balancer
   *
   * @param {object|String}     loadBalancer      The ID or instance of the Load Balancer
   * @param {function}          callback ( error, connectionThrottle )
   */
  getConnectionThrottleConfig: function (loadBalancer, callback) {
    var self = this,
        loadBalancerId =
          loadBalancer instanceof lb.LoadBalancer ? loadBalancer.id : loadBalancer;

    self._request({
      path: urlJoin(_urlPrefix, loadBalancerId, 'connectionthrottle')
    }, function (err, body) {
      return callback(err, body.connectionThrottle);
    });
  },

  /**
   * client.updateConnectionThrottle
   * @function
   *
   * @description Update or add a connection throttle for the provided Load Balancer
   *
   * @link http://docs.rackspace.com/loadbalancers/api/v1.0/clb-devguide/content/Overview-d1e82.html 
   *
   * @param {object|String}     loadBalancer                    The ID or instance of the Load Balancer
   * @param {Object}            details       
   * @param {Integer}           [details.maxConnections]        Max number of connections for a single IP (1-100000)
   * @param {Integer}           [details.minConnections]        Deprecated as of API v1.22
   * @param {Integer}           [details.maxConnectionRate]     Deprecated as of API v1.22
   * @param {Integer}           [details.rateInterval]          Deprecated as of API v1.22
   * @param {function}          callback ( error )
   *
   */
  updateConnectionThrottle: function (loadBalancer, details, callback) {
    var self = this,
        loadBalancerId =
          loadBalancer instanceof lb.LoadBalancer ? loadBalancer.id : loadBalancer;

    var options = _.pick(details, ['maxConnectionRate', 'maxConnections',
      'minConnections', 'rateInterval']);

    self._request({
      path: urlJoin(_urlPrefix, loadBalancerId, 'connectionthrottle'),
      method: 'PUT',
      body: {
        connectionThrottle: options
      }
    }, function (err) {
      return callback(err);
    });
  },

  /**
   * client.disableConnectionThrottle
   * @function
   *
   * @description Disables connection throttling on the provided Load Balancer
   *
   * @param {object|String}     loadBalancer      The ID or instance of the Load Balancer
   * @param {function}          callback ( error )
   */
  disableConnectionThrottle: function (loadBalancer, callback) {
    var self = this,
        loadBalancerId =
          loadBalancer instanceof lb.LoadBalancer ? loadBalancer.id : loadBalancer;

    self._request({
      path: urlJoin(_urlPrefix, loadBalancerId, 'connectionthrottle'),
      method: 'DELETE'
    }, function (err) {
      return callback(err);
    });
  },

  /// Content Caching Functionality

  /**
   * client.getContentCachingConfig
   * @function
   *
   * @description Get the current content caching configuration for the provided Load Balancer
   *
   * @param {object|String}     loadBalancer      The ID or instance of the Load Balancer
   * @param {function}          callback ( error, contentCaching )
   */
  getContentCachingConfig: function (loadBalancer, callback) {
    var self = this,
        loadBalancerId =
          loadBalancer instanceof lb.LoadBalancer ? loadBalancer.id : loadBalancer;

    self._request({
      path: urlJoin(_urlPrefix, loadBalancerId, 'contentcaching')
    }, function (err, body) {
      return callback(err, body.contentCaching);
    });
  },

  /**
   * client.updateContentCaching
   * @function
   *
   * @description Enable or disable content caching for the provided Load Balancer
   *
   * @param {object|String}     loadBalancer            The ID or instance of the Load Balancer
   * @param {Boolean}           enabled                 Enable or disable logging
   * @param {function}          callback ( error )
   */
  updateContentCaching: function (loadBalancer, enabled, callback) {
    var self = this,
        loadBalancerId =
          loadBalancer instanceof lb.LoadBalancer ? loadBalancer.id : loadBalancer;

    if (typeof enabled !== 'boolean') {
      throw new Error('enabled must be a boolean value');
    }

    self._request({
      path: urlJoin(_urlPrefix, loadBalancerId, 'contentcaching'),
      method: 'PUT',
      body: {
        contentCaching: {
          enabled: enabled
        }
      }
    }, function (err) {
      return callback(err);
    });
  },

  /// Error Page Functionality

  /**
   * client.getErrorPage
   * @function
   *
   * @description Get the error page for the provided Load Balancer
   *
   * @param {object|String}     loadBalancer      The ID or instance of the Load Balancer
   * @param {function}          callback ( error, content )
   */
  getErrorPage: function(loadBalancer, callback) {
    var self = this,
        loadBalancerId =
          loadBalancer instanceof lb.LoadBalancer ? loadBalancer.id : loadBalancer;

    self._request({
      path: urlJoin(_urlPrefix, loadBalancerId, 'errorpage')
    }, function (err, body) {
      if (err) {
        return callback(err);
      }
      else if (!body || !body.errorpage || !body.errorpage.content) {
        return callback(new Error('Unexpected empty response'));
      }
      else {
        return callback(err, body.errorpage.content);
      }
    });
  },

  /**
   * client.setErrorPage
   * @function
   *
   * @description Set the error page for the provided Load Balancer
   *
   * @param {object|String}     loadBalancer      The ID or instance of the Load Balancer
   * @param {String}            content           HTML representing your new error page
   * @param {function}          callback ( error )
   */
  setErrorPage: function (loadBalancer, content, callback) {
    var self = this,
        loadBalancerId =
          loadBalancer instanceof lb.LoadBalancer ? loadBalancer.id : loadBalancer;

    self._request({
      path: urlJoin(_urlPrefix, loadBalancerId, 'errorpage'),
      method: 'PUT',
      body: {
        errorpage: {
          content: content
        }
      }
    }, function (err) {
      return callback(err);
    });
  },

  /**
   * client.deleteErrorPage
   * @function
   *
   * @description Remove the error page for the provided Load Balancer
   *
   * @param {object|String}     loadBalancer      The ID or instance of the Load Balancer
   * @param {function}          callback ( error )
   */
  deleteErrorPage: function (loadBalancer, callback) {
    var self = this,
        loadBalancerId =
          loadBalancer instanceof lb.LoadBalancer ? loadBalancer.id : loadBalancer;

    self._request({
      path: urlJoin(_urlPrefix, loadBalancerId, 'errorpage'),
      method: 'DELETE'
    }, function (err) {
      return callback(err);
    });
  },

  /// Stats & Usage APIs

  /**
   * client.getStats
   * @function
   *
   * @description Get statistics for the provided Load Balancer
   *
   * @param {object|String}     loadBalancer      The ID or instance of the Load Balancer
   * @param {function}          callback ( error, body )
   */
  getStats: function (loadBalancer, callback) {
    var self = this,
      loadBalancerId =
        loadBalancer instanceof lb.LoadBalancer ? loadBalancer.id : loadBalancer;

    self._request({
      path: urlJoin(_urlPrefix, loadBalancerId, 'stats')
    }, function (err, body) {
      callback(err, body);
    });
  },

  /**
   * client.getBillableLoadBalancers
   * @function
   *
   * @description Gets the billable Load Balancer within the query limits provided
   *
   * @param {Date|String}       startTime               The start time for the query
   * @param {Date|String}       endTime                 The end time for the query
   * @param {object|Function}   [options]
   * @param {object}            [options.limit]         The number of records to return
   * @param {object}            [options.offset]        The offset for the record list
   * @param {function}          callback ( error, loadBalancers )
   */
  getBillableLoadBalancers: function (startTime, endTime, options, callback) {
    var self = this;

    if (typeof options === 'function') {
      callback = options;
      options = {};
    }

    var requestOpts = {
      path: urlJoin(_urlPrefix, 'billable'),
      qs: {
        startTime: typeof startTime === 'Date' ? startTime.toISOString() : startTime,
        endTime: typeof endTime === 'Date' ? endTime.toISOString() : endTime
      }
    };

    requestOpts.qs = _.extend(requestOpts.qs, _.pick(options, ['offset', 'limit']));

    self._request(requestOpts, function (err, body, res) {
      return callback(err, body.loadBalancers.map(function (loadBalancer) {
        return new lb.LoadBalancer(self, loadBalancer);
      }), res);
    });
  },

  /**
   * client.getAccountUsage
   * @function
   *
   * @description Lists account level usage
   *
   * @param {Date|String}     startTime     The start time for the query
   * @param {Date|String}     endTime       The end time for the query
   * @param {function}        callback ( error, body ) 
   */
  getAccountUsage: function (startTime, endTime, callback) {
    var self = this;

    self._request({
      path: urlJoin(_urlPrefix, 'usage'),
      qs: {
        startTime: typeof startTime === 'Date' ? startTime.toISOString() : startTime,
        endTime: typeof endTime === 'Date' ? endTime.toISOString() : endTime
      }
    }, function (err, body) {
      return callback(err, body);
    });
  },

  /**
   * client.getHistoricalUsage
   * @function
   *
   * @description Get historical usage data for a provided Load Balancer. Data available for 90 days of service activity.
   *
   * @param {object|String}     loadBalancer      The ID or instance of the Load Balancer
   * @param {Date|String}       startTime         The start time for the query
   * @param {Date|String}       endTime           The end time for the query
   * @param {function}          callback ( error, body )
   */
  getHistoricalUsage: function (loadBalancer, startTime, endTime, callback) {
    var self = this,
      loadBalancerId =
        loadBalancer instanceof lb.LoadBalancer ? loadBalancer.id : loadBalancer;

    self._request({
      path: urlJoin(_urlPrefix, loadBalancerId, 'usage'),
      qs: {
        startTime: startTime,
        endTime: endTime
      }
    }, function (err, body) {
      return callback(err, body);
    });
  },

  /**
   * client.getCurrentUsage
   * @function
   *
   * @description Get current usage data for a provided Load Balancer.
   *
   * @param {object|String}     loadBalancer      The ID or instance of the Load Balancer
   * @param {function}          callback ( error )
   */
  getCurrentUsage: function (loadBalancer, callback) {
    var self = this,
      loadBalancerId =
        loadBalancer instanceof lb.LoadBalancer ? loadBalancer.id : loadBalancer;

    self._request({
      path: urlJoin(_urlPrefix, loadBalancerId, 'usage', 'current')
    }, function (err, body) {
      return callback(err, body);
    });
  },

  /**
   * client.getAllowedDomains
   * @function
   *
   * @description Get a list of domains that are available in lieu of IP addresses when adding nodes to a Load Balancer
   *
   * @param {function}        callback ( error, allowedDomains )
   */
  getAllowedDomains: function (callback) {
    var self = this;

    self._request({
      path: urlJoin(_urlPrefix, 'alloweddomains')
    }, function (err, body) {
      return callback(err, body.allowedDomains);
    });
  },

  /// Protocols and Algorithms

  /**
   * client.getProtocols
   * @function
   *
   * @description Get a list of supported load balancer protocols
   *
   * @param {function}        callback ( error, protocols )
   */
  getProtocols: function(callback) {
    var self = this;

    self._request({
      path: urlJoin(_urlPrefix, 'protocols')
    }, function (err, body) {
      return callback(err, body.protocols);
    });
  },

  /**
   * client.getAlgorithms
   * @function
   *
   * @description Get a list of supported load balancer algorithms
   *
   * @param {function}        callback ( error, algorithms )
   */
  getAlgorithms: function (callback) {
    var self = this;

    self._request({
      path: urlJoin(_urlPrefix, 'algorithms')
    }, function (err, body) {
      return callback(err, body.algorithms);
    });
  }
};

// Private function for validation of createLoadBalancer Inputs
var validateLbInputs = function (inputs) {

  var errors = {
    requiredParametersMissing: [],
    invalidInputs: []
  }, response;

  if (!inputs.name) {
    errors.requiredParametersMissing.push('name');
  }

  if (!inputs.nodes) {
    errors.requiredParametersMissing.push('nodes');
  }

  if (!inputs.protocol) {
    errors.requiredParametersMissing.push('protocol');
  }

  if (!inputs.port) {
    errors.requiredParametersMissing.push('port');
  }

  if (!inputs.virtualIps) {
    errors.requiredParametersMissing.push('virtualIps');
  }

  if (inputs.name && inputs.name.length > 128) {
    errors.invalidInputs.push('name exceeds maximum 128 length');
  }

  if (!inputs.protocol ||
    typeof(inputs.protocol) !== 'string' || !lb.Protocols[inputs.protocol]) {
    errors.invalidInputs.push('please specify a valid protocol');
  }

  // TODO Node validation

  if (errors.requiredParametersMissing.length) {
    response ? response.requiredParametersMissing = errors.requiredParametersMissing :
      response = {
        requiredParametersMissing: errors.requiredParametersMissing
      };
  }

  if (errors.invalidInputs.length) {
    response ? response.invalidInputs = errors.invalidInputs :
      response = {
        invalidInputs: errors.invalidInputs
      };
  }

  return response;
};
