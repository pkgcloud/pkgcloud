var pkgcloud = require('../../lib/pkgcloud');

var rackspace = pkgcloud.cdn.createClient({
  provider: 'rackspace',
  username: 'rackspace_id',
  apiKey: '1234567890poiiuytrrewq'
});

// Basic flavor and service operations. Please note that due to the asynchronous nature of Javascript programming,
// the code sample below will cause unexpected results if run as-a-whole and are meant for documentation 
// and illustration purposes.

// 1 -- to list all available CDN flavors
rackspace.getFlavors(function (err, flavors) {
  if (err) {
    console.dir(err);
    return;
  }
  flavors.forEach(function (flavor) {
    console.log(flavor.id);
  });
});

// 2 -- to create a service
rackspace.createService({
  name: 'sample-service-test',
  domains: [
    {
      domain: 'www.acme.com'
    },
    {
      domain: 'acme.com'
    }
  ],
  origins: [
    {
      origin: '12.34.56.78'
    }
  ],
  flavorId: 'cdn'
}, function (err, service) {
  if (err) {
    console.dir(err);
    return;
  }

  console.log(service.id);
  console.log(service.name);

});

// 2 -- to list our services
rackspace.getServices(function (err, services) {
  if (err) {
    console.dir(err);
    return;
  }

  services.forEach(function(service) {
    console.log(service.id);
    console.log(service.name);
  });

});

// 3 -- to get our service and update it
rackspace.getService(function (err, service) {
  if (err) {
    console.dir(err);
    return;
  }

  service.origins[0].origin = '88.88.88.88';

  rackspace.updateService(service, function (err, service) {
    if (err) {
      console.dir(err);
      return;
    }

    console.log(service.origins[0].origin);

  });

});

// 4 -- to delete our service
rackspace.deleteService('abcdef01-2345-6789-abcd-ef0123456789', function (err) {
  if (err) {
    console.dir(err);
    return;
  }

  console.log('Service deletion request was successful.');
});
