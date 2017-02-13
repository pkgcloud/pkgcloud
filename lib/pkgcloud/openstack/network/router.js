var util = require('util'),
    base = require('../../core/network/router'),
    _ = require('underscore');

var Router = exports.Router = function Router(client, details) {
  base.Router.call(this, client, details);
};

util.inherits(Router, base.Router);

Router.prototype._setProperties = function (details) {
  this.status = details.status || this.status;
  this.name = details.name || this.name;
  this.externalGatewayInfo = details.external_gateway_info	 || this.externalGatewayInfo;
  this.adminStateUp = details.admin_state_up || this.adminStateUp;
  //this.externalFixedIps = details.externalFixedIps || this.externalFixedIps;
  this.tenantId = details.tenant_id || this.tenantId;
  this.routes = details.routes || this.routes;
  this.id = details.id || this.id;
  
};


Router.prototype.toJSON = function () {
  return _.pick(this, ['status', 'name', 'externalGatewayInfo', 'adminStateUp',
  'tenantId', 'routes', 'id']);
};


