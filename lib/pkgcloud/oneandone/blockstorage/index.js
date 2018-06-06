/**
 * Created by Ali Bazlamit on 8/28/2017.
 */
exports.Client = require('./client').Client;
exports.Snapshot = require('./snapshot').Snapshot;
exports.BlockStorage = require('./volume').BlockStorage;

exports.createClient = function (options) {
  return new exports.Client(options);
};
