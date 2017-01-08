var fs = require('fs');
var path = require('path');
var pkgcloud = require('../../lib/pkgcloud');

var client = pkgcloud.storage.createClient({
  provider: 'azure-v2',
  subscriptionId: '{subscriptionId}',  
  resourceGroup: '{resourceGroup}',

  servicePrincipal: {
    clientId: '{spClientId}',
    secret: '{spSecret}',
    domain: '{spDomain}'
  }
});

// client.getFiles('storageacountname', null, (err, files) => {
  
//   var file = files[0];
//   client.getFile('storageacountname', file, null, (err, file) => {
//     console.dir(file);
//   })
// });

client.getFiles('storageacountname', { container: 'container-name' }, (err, files) => {
  
  var file = files[0];
  var download = client.download({
    container: 'storageacountname',
    storage: { container: 'container-name' },
    remote: 'file.name.to.download.ext',
    local: path.join(__dirname, 'file.name.to.download.ext')
  }, err => {
    return err ? console.dir(err) : null;
  });

  download.on('error', function(err) {
    console.error(err);
  });

  download.on('end', function(file) {
    console.log('file write has ended');
  });

  download.on('data', function(data) {
    console.log(data && data.length);
  });
});

// client.createContainer('storageacountname', (err, container) => {
//   console.log('created: ', container.toJSON());

//   client.getContainer('storageacountname', (err, container) => {
//     console.log('found: ', container.toJSON());
//   });
// });

// client.getContainers((err, containers) => {
//   if (err) {
//     console.error(err);
//   }

//   client.getContainer(containers[0], (err, container) => {
//     console.log('found: ', container.toJSON());
//   });

//   containers.forEach(function (container) {
//     console.log(container.toJSON());
//   });
// });
