var pkgcloud = require('../../../../../lib/pkgcloud'),
    compute = pkgcloud.providers.rackspace.compute;

//
// Gets all images (rackspace or custom by username) for the authenticated username / apikey.
// Parameters: details? callback
//
exports.getImages = function (details, callback) {
  var self = this;
  if (typeof details === 'function') {
    callback = details;
    details = false;
  }

  if (details) return this.getImageDetails(callback);

  this.request('images.json', callback, function (body) {
    callback(null, JSON.parse(body).images.map(function (result) {
      return new compute.Image(self, result);
    }));
  });
};

exports.getImageDetails = function (callback) {
  var self = this;
  this.request('images/detail.json', callback, function (body) {
    callback(null, JSON.parse(body).images.map(function (result) {
      return new compute.Image(self, result);
    }));
  });
};

//
// Gets the details for the image specified by id.
// Parameters: id callback
//
exports.getImage = function (id, callback) {
  var self = this;
  this.request('images/' + id, callback, function (body) {
    callback(null, new compute.Image(self, JSON.parse(body).image));
  });
};

//
// Creates a new image from the specified server with the given name.
// Server can be an instance of a pkgcloud Server or a server id.
// Parameters: name server callback
//
exports.createImage = function (name, server, callback) {
  var serverId = server instanceof compute.Server ? server.id : parseInt(server, 10),
      self = this;

  this.request(createOptions, {
    method: 'POST',
    path: 'images',
    body: {
      image: {
        name: name,
        serverId: serverId
      }
    }
  }, callback, function (body) {
    callback(null, new compute.Image(self, JSON.parse(body).image));
  });
};

exports.destroyImage = function (image, callback) {
  var imageId = image instanceof compute.Image ? image.id : image;

  this.request({
    method: 'DELETE',
    uri: this.imageUrl(imageId)
  }, callback, function () {
    callback(null, true);
  });
};
