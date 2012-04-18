var pkgcloud = require('../../../../../lib/pkgcloud'),
    Flavor = pkgcloud.providers.rackspace.database.Flavor;

// Get Flavors
// Get the list of flavors in an array of Flavor's instances'
exports.getFlavors = function (details, callback) {
  var self = this;
  if (!callback && typeof details === 'function') {
    callback = details;
    details = false;
  }
  
  // @Todo: Add the call to getFlavorDetails()
  if (details) {
    return this.getFlavorDetails(callback);
  }

  return this.request('flavors', callback, function (body) {
    callback(null, body.flavors.map(function (result) {
      return new Flavor(self, result);
    }));
  });
};

exports.getFlavorDetails = function (callback) {
  var self = this;
  return this.request('flavors/detail', callback, function (body) {
    callback(null, body.flavors.map(function (result) {
      return new Flavor(self, result);
    }));
  });
};

// Get the details for the flavor by id
exports.getFlavor = function (id, callback) {
  var self = this;
  return this.request('flavors/' + id, callback, function (body) {
    callback(null, new Flavor(self, body.flavor));
  });
};
