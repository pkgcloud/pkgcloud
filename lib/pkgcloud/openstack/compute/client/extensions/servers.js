/*
 * servers.js: OpenStack Servers Extension
 *
 * (C) 2014
 *      Alvaro M. Reol
 * MIT LICENSE
 *
 */

/**
 * client.startServer
 *
 * @description Starts a stopped server and changes its status to ACTIVE.
 *
 * @param {String|Object}   server          The server ID or server to start
 * @param {function}        callback
 * @returns {*}
 */
exports.startServer = function (server, callback) {
    return this._doServerAction(server,
        {'os-start': null},
        function (err) {
            return callback(err);
    });
};

/**
 * client.stopServer
 *
 * @description Stops a running server and changes its status to STOPPED.
 *
 * @param {String|Object}   server          The server ID or server to stop
 * @param {function}        callback
 * @returns {*}
 */
exports.stopServer = function (server, callback) {
    return this._doServerAction(server,
        {'os-stop': null},
        function (err) {
            return callback(err);
        });
};

/**
 * client.shelveServer
 *
 * @description Shelves a server and changes its status to SHELVED then, eventually, to OFFLOADED.
 * 
 * @see https://developer.openstack.org/api-ref/compute/#shelve-server-shelve-action
 *
 * @param {String|Object}   server          The server ID or server to shelve
 * @param {function}        callback
 * @returns {*}
 */
exports.shelveServer = function (server, callback) {
  return this._doServerAction(server, {'shelve': null}, callback);
};

/**
 * client.offloadServer
 *
 * @description Offload a shelved server and changes its status to OFFLOADED.
 * 
 * @see https://developer.openstack.org/api-ref/compute/#shelf-offload-remove-server-shelveoffload-action
 *
 * @param {String|Object}   server          The server ID or server to offload
 * @param {function}        callback
 * @returns {*}
 */
exports.offloadServer = function (server, callback) {
  return this._doServerAction(server, {'shelveOffload': null}, callback);
};
  
/**
 * client.unshelveServer
 *
 * @description Unshelve a shelved or offloaded server and changes its status to RUNNING.
 * 
 * @see https://developer.openstack.org/api-ref/compute/#unshelve-restore-shelved-server-unshelve-action
 *
 * @param {String|Object}   server          The server ID or server to unshelve
 * @param {function}        callback
 * @returns {*}
 */
exports.unshelveServer = function (server, callback) {
  return this._doServerAction(server, {'unshelve': null}, callback);
};
