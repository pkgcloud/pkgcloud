## Using the Amazon (AWS) provider in pkgcloud

The Amazon provider in pkgcloud supports the following services:

* **Compute** (EC2)
* **Storage** S3 (Simple Storage Service)

### Client Creation

For all of the Amazon services, you create a client with the same options:

```Javascript
var client = require('pkgcloud').compute.createClient({
   provider: 'amazon',
   key: 'your-secret-key-id', // secret key
   keyId: 'your-access-key-id' // access key id
   region: 'us-west-2' // region
});
```

```Javascript
var client = require('pkgcloud').storage.createClient({
   provider: 'amazon',
   key: 'your-secret-key-id', // secret key
   keyId: 'your-access-key-id' // access key id
   region: 'us-west-2' // region
});
```