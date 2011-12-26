//
// Gets all images (rackspace or custom by username) for the authenticated username / apikey.
// Parameters: details? callback
//
exports.getImages = function (callback) {
  var self = this;
  this.request(['images.json'], callback, function (body) {
    callback(null, JSON.parse(body).images.map(function (result) {
      return new base.Image(self, result);
    }));
  });
};

exports.getImageDetails = function () {
  var self = this;
  this.request(['images', 'details.json'], callback, function (body) {
    callback(null, JSON.parse(body).images.map(function (result) {
      return new base.Image(self, result);
    }));
  });  
};

//
// Gets the details for the image specified by id.
// Parameters: id callback
//
exports.getImage = function (id, callback) {
  var self = this;
  this.request(['images', id], callback, function (body) {
    callback(null, new (cloudservers.Image)(self, JSON.parse(body).image));
  });
};

//
// Creates a new image from the specified server with the given name.
// Server can be an instance of a node-cloudservers Server or a server id.
// Parameters: name server callback
//
exports.createImage = function (name, server, callback) {
  var serverId = server instanceof cloudservers.Server ? server.id : parseInt(server, 10),
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
  }, function (body) {
    callback(null, new (base.Image)(self, JSON.parse(body).image));
  });
};

exports.destroyImage = function (image, callback) {
  var imageId = image instanceof base.Image ? image.id : image;

  this.request({
    method: 'DELETE',
    uri: this.imageUrl(imageId)
  }, callback, function () {
    callback(null, true);
  });
};