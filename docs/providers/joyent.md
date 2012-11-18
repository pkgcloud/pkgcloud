# Using Joyent with `pkgcloud`

* [Using Compute](#using-compute)

<a name="using-compute"></a>
## Using Compute

``` js
  var path = require('path'),
      fs   = require('fs');

  //
  // Joyent requires a username / password or key / keyId combo.
  // key/keyId should be registered in Joyent servers.
  // check `test/helpers/index.js` for details on key/keyId works.
  //
  var joyent = pkgcloud.compute.createClient({
    provider: 'joyent',
    account: 'nodejitsu'
    keyId: '/nodejitsu1/keys/dscape',
    key: fs.readFileSync(path.join(process.env.HOME, '.ssh/id_rsa'), 'ascii')
  });
```