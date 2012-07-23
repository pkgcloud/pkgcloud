//
// Require the node-dbox library
// see: https://github.com/sintaxi/node-dbox
//
var dbox  = require("dbox");

var Client = exports.Client = function (options) {
  var self = this;
  
  //
  // Create a new "app" which represents a DropBox enabled App
  //
  self.app = dbox.app({ 
    "app_key"    : options.access_token_key,
    "app_secret" : options.access_token_secret
  });

  //
  // Create a new client instance
  //
  self.client            = self.app.createClient(options);

  //
  // Provide additional sugar syntax to mimic Node's FS API
  //
  self.readFile          = self.client.get;
  self.createReadStream  = self.client.createReadStream;
  self.writeFile         = self.client.put;
  self.readdir           = self.client.readdir;
  return self;
};

//
// Imitate `fs.stat` method
//
Client.prototype.stat = function (path, callback) {
  var self = this;
  self.client.metadata(path, function(status, result){
    if (status === 404) {
      return callback({ code: "ENOENT" })
    }
    result.isDirectory = function () {
      return result.is_dir;
    };
    result.isFile = function () {
      return !result.is_dir;
    };
    callback(null, result)
  });
};
