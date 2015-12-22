# Using DigitalOcean with `pkgcloud`

* [Using Compute](#using-compute)

<a name="using-compute"></a>
## Using Compute

DigitalOcean requires an API token.

```js
var pkgcloud = require('pkgcloud');
var digitalocean = pkgcloud.compute.createClient({
  provider: 'digitalocean',
  token: '<digitalocean-api-token>'
});
```
