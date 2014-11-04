## Using the Google Cloud provider in pkgcloud

The Google Cloud provider in pkgcloud supports the following services:

* **Storage** Google Cloud Storage (Simple Storage Service)

### Client Creation

For all of the Google services, you create a client with the same options:

```Javascript
var client = require('pkgcloud').storage.createClient({
   provider: 'google',
   keyFilename: '/path/to/a/keyfile.json', // path to a JSON key file
   projectId: 'eco-channel-658' // project id
});
```