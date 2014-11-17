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