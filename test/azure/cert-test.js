//TODO: Make this a vows test
var fs = require('fs');
var azureCert = require('../../lib/pkgcloud/azure/compute/client/azure/cert.js');


// load azure config file
var config = JSON.parse(fs.readFileSync("../configs/azure.json",'utf8'));

var path = '/Users/stammen/dev/microsoft/cert/myCert.pem';

azureCert.getAzureCert('/Users/stammen/dev/microsoft/cert/myCert.pem', function(err, result) {
  if(err) {
    console.dir(err);
  } else {
    console.dir(result);
  }
});


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