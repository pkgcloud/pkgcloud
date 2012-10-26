//TODO: Make this a vows test

var azureServer = require('../../lib/pkgcloud/azure/compute/client/azure/azureServer.js');
var fs = require('fs');
var async = require('async');

var options = {
  name: "create-test-ids2",
  flavor: "ExtraSmall",
  image: "CANONICAL__Canonical-Ubuntu-12-04-amd64-server-20120528.1.3-en-us-30GB.vhd"
};

// load azure config file
var config = JSON.parse(fs.readFileSync("../configs/azure.json",'utf8'));
//console.dir(config);

var testServer = new azureServer.AzureServerInfo('create-test-ids2','create-test-ids2');

var az = new azureServer.AzureServer(config);

var createServer = false;
var destroyServer = true;

async.waterfall([
  function(callback) {
    if(!createServer) {
      callback(null, testServer);
      return;
    }
    console.log("creating server:" + options.name)
    az.createServer(options, function(err, server) {
       if(err) {
         callback(err);
       } else {
         callback(null, server);
       }
     });
  },
  function(server, callback) {
    console.log("destroying server:" + server.name)
    az.destroyServer(server, function(err, result) {
      callback(err, result);
    });
  }],
  function (err, result) {
    if(err) {
      console.dir(err);
    } else {
      console.dir('ok');
    }
  }
);




/*


 server.findServer(testServer, function(err, results) {

 if(err) {
 console.log(err);
 } else {
 console.dir(results);
 }
 });


 server.getServers(function(err, results) {

 if(err) {
 console.log(err);
 } else {
 console.dir(results);
 }
 });


 */

/*
 server.createServer(options, function(err, results) {

 if(err) {
 console.log(err);
 } else {
 //console.dir(server.hostedService);
 //console.dir(server.images);
 //console.dir(server.storageAccounts);
 }
 });


 {
 ssh:{
 publickeys:{
 publickey:{
 fingerprint:'certificate-fingerprint',
 path:'SSH-public-key-storage-location'
 }
 },
 keypairs:{
 keypair:{
 fingerprint:{
 value:'certificate-fingerprint',
 path:'SSH-public-key-storage-location'
 }
 }
 }
 }
 }
 */