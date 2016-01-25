var pkgcloud = require('../../lib/pkgcloud');

var client = pkgcloud.storage.createClient({
  provider: 'amazon',
  accessKey: 'asdfkjas;dkj43498aj3n',
  accessKeyId: '98kja34lkj'
});

client.getContainers(function (err, containers) {
  if (err) {
    console.error(err);
  }

  containers.forEach(function (container) {
    console.log(container.toJSON());
  });
});
