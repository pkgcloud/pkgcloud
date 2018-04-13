/**
 * Created by Ali Bazlamit on 8/14/2017.
 */
exports.Client = require('./client').Client;
exports.Server = require('./server').Server;
exports.Image = require('./image').Image;
exports.Flavor = require('./flavor').Flavor;

exports.createClient = function (options) {
  return new exports.Client(options);
};
