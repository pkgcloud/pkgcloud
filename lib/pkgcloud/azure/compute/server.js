/*
 * server.js: AWS Server
 *
 * (C) 2012 Nodejitsu Inc.
 *
 */

var utile = require('utile'),
  base  = require('../../core/compute/server');

var Server = exports.Server = function Server(client, details) {
  base.Server.call(this, client, details);
};

utile.inherits(Server, base.Server);

Server.prototype._setProperties = function (details) {
  this.id   = details.server.Name;
  this.name = details.server.Name;

  if (details.server.Status) {
    switch (details.server.Status) {
      case 'CreatingVM':
      case 'StartingVM':
      case 'CreatingRole':
      case 'StartingRole':
      case 'Provisioning':
        this.status = 'PROVISIONING';
        break;
      case 'ReadyRole':
      case 'Running':
        this.status = 'RUNNING';
        break;
      case 'StoppingVM':
      case 'StoppedVM':
      case 'StoppingRole':
      case 'StoppedRole':
        this.status = 'STOPPED';
        break;
      case 'DeletingVM':
        this.status = 'TERMINATED';
        break;
      case 'RestartingRole':
      case 'CyclingRole':
        this.status = "REBOOT";
        break;
      case 'FailedStartingVM':
      case 'UnresponsiveRole':
        this.status = 'ERROR';
        break;
      case 'RoleStateUnknown':
      default:
        this.status = 'UNKNOWN';
        break;
    }
  } else {
    this.status = 'UNKNOWN';
  }

  //
  // Azure specific
  //
  this.serviceName  = details.serviceName;
  this.original = this.azure = details;
};
