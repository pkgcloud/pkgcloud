var fs = require('fs'),
    pkgcloud = require('../../lib/pkgcloud');

var client = pkgcloud.storage.createClient({
  provider: 'rackspace',
  username: 'rackspace_id',
  apiKey: '1234567890poiiuytrrewq',
  region: 'IAD' // storage requires region or else assumes default
});

// Basic container and file operations. Please note that due to the asynchronous nature of Javascript programming,
// the code sample below will cause unexpected results if run as-a-whole and are meant for documentation 
// and illustration purposes.

// 1 -- to create a container
client.createContainer({
  name: 'sample-container-test',
  metadata: {
    callme: 'maybe'
  }
}, function (err, container) {
  if (err) {
    console.dir(err);
    return;
  }

  console.log(container.name);
  console.log(container.metadata);

});

// 2 -- to list our containers
client.getContainers(function (err, containers) {
  if (err) {
    console.dir(err);
    return;
  }

  containers.forEach(function(container) {
    console.log(container.name);
  });

});

// 3 -- to create a container and upload a file to it
client.createContainer({
  name: 'sample-container',
  metadata: {
    callme: 'maybe'
  }
}, function (err, container) {
  if (err) {
    console.dir(err);
    return;
  }

  var myPicture = fs.createReadStream('/path/to/some/file/picture.jpg');

  var upload = client.upload({
    container: container.name,
    remote: 'profile-picture.jpg'
  });

  upload.on('error', function(err) {
    console.error(err);
  });

  upload.on('success', function(file) {
    console.log(file.toJSON());
  });

  myPicture.pipe(upload);
});

// 4 -- setup container as CDN
client.getContainer('container-name', function (err, container) {
  if(err){
    console.log('There was an error retrieving container:\n');
    console.dir(err);
    return;
  }

  container.enableCdn(function (error, cont) {
    if (error) {
      console.log('There was an error setting container as CDN:\n');
      console.dir(error);
      return;
    }
    console.log('Successfully set bucket as CDN bucket');
    console.log(cont);
  });  
});

// 5 -- to get a container, empty it, then finally destroying it
client.getContainer('sample-container', function (err, container) {
  if (err) {
    console.dir(err);
    return;
  }

  // destroying a container automatically calls the remove file API to empty before delete
  client.destroyContainer(container, function (err, result) {
    if (err) {
      console.dir(err);
      return;
    }

    console.log('Container ' + container.name + ' was successfully destroyed.');
    console.log(result);
  });
});
