
//TODO: Make this a vows test

var Client = new require('../../../lib/pkgcloud/core/base/client').Client;
var helpers = require('../../helpers');
var async = require('async');

var fs = require('fs');
var async = require('async');

var client = helpers.createClient('azure2', 'storage');

var options = {
  container: 'pkgcloud-test-container',
  remote: 'test-file.txt'
};

/*
client.sendBlockList(options, 3, function(err, res) {
  if(err) {
    console.dir(err);
  } else {
    console.dir(res);
  }
});
*/


var stream = client.upload(options, function(err, res) {
  if(err) {
    console.dir(err);
  } else {
    console.dir(res);
  }
});

var file = fs.createReadStream(helpers.fixturePath('fillerama.txt'));
//var file = fs.createReadStream(helpers.fixturePath('bigfile.raw'));

file.pipe(stream);


/*

var q = async.queue(function (task, callback) {
  console.log('hello ' + task.name);
  callback();
}, 2);


// assign a callback
q.drain = function() {
  console.log('all items have been processed');
}

// add some items to the queue

q.push({name: 'foo'}, function (err) {
  console.log('finished processing foo');
});
q.push({name: 'bar'}, function (err) {
  console.log('finished processing bar');
});

*/
