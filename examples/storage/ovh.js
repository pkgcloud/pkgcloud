var fs = require('fs'),
    pkgcloud = require('../../lib/pkgcloud'),
    _ = require('underscore');

/*
To obtain these parameters you must:
1) have an OVH account,
2) apply for Public Cloud Storage
3) create an application as described in https://api.ovh.com/g934.first_step_with_api
4) go to https://api.ovh.com and explore the API
5) login with your account
6) go to API command '/cloud/{serviceName}/pcs/{pcsServiceName}/credentials'
*/

var ovh = pkgcloud.storage.createClient({
  provider: 'ovh',
  username: 'username', //ex. md12345-1234567
  password: 'password',    //ex. ksadkRjnhtr
  tenantName: 'tenant' // ex. T_md12345-1234567
});

// Basic container and file operations. Please note that due to the asynchronous nature of Javascript programming,
// the code sample below will cause unexpected results if run as-a-whole and are meant for documentation 
// and illustration purposes.
console.log('example 1');
// 1 -- to create a container
ovh.createContainer({
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

  console.log('example 2');
  // 2 -- to list our containers
  ovh.getContainers(example2);

});

var example2=function (err, containers) {
  if (err) {
    console.dir(err);
    return;
  }

  _.each(containers, function(container) {
    console.log(container.name);
  });

  console.log('example 3');
  // 3 -- to create a container and upload a file to it
  ovh.createContainer({
    name: 'sample-container',
    metadata: {
      callme: 'maybe'
    }
  },example3);

};
var example3= function (err, container) {
  if (err) {
    console.dir(err);
    return;
  }

  var myPicture = fs.createReadStream('/path/to/some/file/picture.jpg');
  myPicture.pipe(ovh.upload({
      container: container.name,
      remote: 'profile-picture.jpg'
    },
    function (err, result) {
      if (err) {
        console.dir(err);
        return;
      }

      console.log(result);

      console.log('example 4');
      // 4 -- to get a container, empty it, then finally destroying it
      ovh.getContainer('sample-container',example4);

    }));
};

var example4= function (err, container) {
  if (err) {
    console.dir(err);
    return;
  }

  // destroying a container automatically calls the remove file API to empty before delete
  ovh.destroyContainer(container, function (err, result) {
    if (err) {
      console.dir(err);
      return;
    }

    console.log('Container ' + container.name + ' was successfully destroyed.')
  });
};
