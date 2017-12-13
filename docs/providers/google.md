# Using Google Cloud with `pkgcloud`

The Google Cloud provider in pkgcloud supports the following services:

* **Storage** Google Cloud Storage

Using the Google Cloud provider requires:

1. A project id
2. A JSON key file

Both are provided from the [Google Developers Console](https://console.developers.google.com/project). For detailed instructions, see this [Getting Started guide](https://github.com/GoogleCloudPlatform/gcloud-node/blob/v0.10.0/README.md#authorization).

<br/>
<a name="using-storage"></a>
## Using Storage

```Javascript
var client = require('pkgcloud').storage.createClient({
   provider: 'google',
   keyFilename: '/path/to/a/keyfile.json', // path to a JSON key file
   projectId: 'eco-channel-658' // project id
});
```

### Upload a File with meta
Availible meta properties:
* contentType
* contentEncoding
* contentDisposition
* contentLanguage
* cacheControl
* metadata
```Javascript
var pkgcloud = require('pkgcloud'),
   fs = require('fs');

var client = pkgcloud.storage.createClient({ /* google storage settings */ });

var readStream = fs.createReadStream( 'a-file.txt'); // local path to uploaded file
var writeStream = client.upload({
   container : 'a-container', // container name
   meta : { 
      metadata : { 'param_a' : 'a', 'param_b' : 'b' }, // metadata parametrs
      contentType : 'text/html' // 'binary/octet-stream', etc
   },
   remote : 'remote-file-name.txt' // name of file in storage
});

writeStream.on('error', function(err) {
    // handle your error case
});

writeStream.on('success', function(file) {
    // success, file will be a File model
});

readStream.pipe(writeStream);
```
