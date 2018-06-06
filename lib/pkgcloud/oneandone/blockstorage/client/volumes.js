/**
 * Created by aajdinov on 1/26/2018.
 */

var Volume = require('../volume').Volume,
  oneandone = require('liboneandone');
/**
 // ### function getVolumes (options, callback)
 // #### @options {Object} query parameters
 // ####    @page {int} **Optional** allows the use of pagination. sets the number of block storages that will be shown per page
 // ####    @per_page {int} **Optional** current page to show
 // ####    @sort {String} **Optional** allows to sort the results by priority. sort=-creation_date (desc by creation date)
 // ####    @q {String} **Optional** search one string in hte response and return the elements that contain it. q=My block storage
 // ####    @fields {String} **Optional** returns only the requested parameters. fields=id,name,description,size
 // #### @callback {Function} f(err, blockstorages).
 */
exports.getVolumes = function (options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  var self = this;

  var query_params = {
    'page': options.page,
    'per_page': options.per_page,
    'sort': options.sort, 'q': options.q,
    'fields': options.fields
  };

  oneandone.listBlockStoragesWithOptions(query_params, function (error, response, body) {
    if (error) {
      callback(error);
      return;
    }
    if (response.statusCode != 200) {
      callback(JSON.parse(body));
      return;
    }
    callback(null, JSON.parse(body).map(function (blockstorage) {
      return new Volume(self, blockstorage);
    }));
  });
};

/**
 // ### function getVolume (volume, callback)
 // #### @volume {Volume|String} Volume id or a Volume
 // #### @callback {function} f(err, blockStorage). `blockStorage` is an object that
 // represents the block storage that was retrieved.
 //
 // Information about specific block storage
 */
exports.getVolume = function (volume, callback) {
  var self = this;
  var volumeId = volume instanceof Volume
    ? volume.id
    : volume;

  oneandone.getBlockStorage(volumeId, function (error, response, body) {
    if (error) {
      return callback(error);
    }
    var blkStorage = JSON.parse(body);
    callback(null, new Volume(self, blkStorage));
  });
};

/**
 // ### function createVolume (details, callback)
 // #### @details {Object} block storage details
 // ####    @name {String} name of the block storage
 // ####    @size {int} size of the block storage (min: 20, max: 500, multipleOf: 10)
 // ####    @description {String} **Optional** description of the block storage
 // ####    @datacenter_id {String} **Optional** Id of the datacenter where the block storage will be created
 // ####    @server_id {String} **Optional** Id of the server that the block storage will be attached to
 // #### @callback {Function} f(err, blockstorage).
 */
exports.createVolume = function (details, callback) {
  if (typeof details === 'function') {
    callback = details;
    details = {};
  }
  var blockStorageData = {
    'name': details.name,
    'description': details.description,
    'size': details.size,
    'server': details.server,
    'datacenter_id': details.datacenter_id
  };

  oneandone.createBlockStorage(blockStorageData, function (error, response, body) {
    var self = this;
    if (error) {
      callback(error);
      return;
    }
    if (response.statusCode != 201) {
      callback(JSON.parse(body));
      return;
    }
    var blockstorage = JSON.parse(body);
    callback(null, new Volume(self, blockstorage));
  });
};

/**
 // ### function updateVolume (options, callback)
 // #### @volume {Object} block storage to update
 // ####    @page {int} **Optional** allows the use of pagination. sets the number of block storages that will be shown per page
 // ####    @per_page {int} **Optional** current page to show
 */
exports.updateVolume = function (volume, callback) {
  var self = this;

  var blockStorageId = volume.id;
  var options = {
    'name': volume.name,
    'description': volume.description
  };

  oneandone.updateBlockStorage(blockStorageId, options, function (error, response, body) {
    if (error) {
      callback(error);
      return;
    }
    if (response.statusCode != 202) {
      callback(JSON.parse(body));
      return;
    }
    var blockStorage = JSON.parse(body);
    callback(null, new Volume(self, blockStorage));
  });
};

//
// ### function deleteVolume(volume, callback)
// #### @volume {Volume|String} Volume id or a Volume
// #### @callback {Function} f(err, blockStorageId).
//
// Destroy a Volume in OAO.
//
exports.deleteVolume = function (volume, callback) {
  var blockStorageId = volume instanceof Volume ? volume.id : volume;
  oneandone.deleteBlockStorage(blockStorageId, function (error, response, body) {
    if (error) {
      callback(error);
      return;
    }
    if (response.statusCode != 202) {
      callback(JSON.parse(body));
      return;
    }
    callback(null, JSON.parse(body));
  });
};

exports.waitVolumeReady = function waitVolumeReady(volumeId, callback) {
  var checkBs = {};
  oneandone.getBlockStorage(volumeId, function (error, response, body) {
    checkBs = JSON.parse(body);
    if ((checkBs.state != oneandone.ServerState.POWERED_OFF
      && checkBs.state != oneandone.ServerState.POWERED_ON)
    ) {
      setTimeout(function () {
        waitVolumeReady(checkBs.id, callback);
      }, 20000);
    } else {
      callback();
    }
  });
};