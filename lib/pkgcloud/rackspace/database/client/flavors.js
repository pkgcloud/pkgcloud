
// Get Flavors
exports.getFlavors = function(details, callback) {
  var self = this;
  if (!callback && typeof details === 'function') {
    callback = details;
    details = false;
  }
  
  // @Todo: Add the call to getFlavorDetails()

  this.request('flavors', callback, function (body) {
    console.log('Respuesta Interna', body);
    callback(null, JSON.parse(body).flavors.map(function (result) {
      return result;
    }));
  });
};
