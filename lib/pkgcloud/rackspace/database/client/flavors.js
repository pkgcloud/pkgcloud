var Flavor = require('../flavor').Flavor;

// Get Flavors
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

  this.request('flavors', callback, function (body) {
    callback(null, JSON.parse(body).flavors.map(function (result) {
      return new Flavor(self, result);
    }));
  });
};

exports.getFlavorDetails = function (callback) {
  var self = this;
  this.request('flavors/detail', callback, function (body) {
    callback(null, JSON.parse(body).flavors.map(function (result) {
      return new Flavor(self, result);
    }));
  });
};

// Get the details for the flavor by id
exports.getFlavor = function (id, callback) {
  var self = this;
  this.request('flavors/' + id, callback, function (body) {
    callback(null, new Flavor(self, JSON.parse(body).flavor));
  });
};
