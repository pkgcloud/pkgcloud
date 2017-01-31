## Using the Amazon (AWS) provider in pkgcloud

The Amazon provider in pkgcloud supports the following services:

* **Compute** (EC2)
* **Storage** S3 (Simple Storage Service)

### Client Creation

For all of the Amazon services, you create a client with the same options:

```Javascript
var client = require('pkgcloud').compute.createClient({
   provider: 'amazon',
   keyId: 'your-access-key-id', // access key id
   key: 'your-secret-key-id', // secret key
   region: 'us-west-2' // region
});
```

```Javascript
var client = require('pkgcloud').storage.createClient({
   provider: 'amazon',
   keyId: 'your-access-key-id', // access key id
   key: 'your-secret-key-id', // secret key
   region: 'us-west-2' // region
});
```
### File upload

Whether s3 `multipart-upload` or `putObject` API  is used depends on the `partSize` option value and the size of file being uploaded.
Single `putObject` request is made if an object being uploaded is not large enough. if the object size exceeds defined `partSize`, it uses `multipart-upload` API


```Javascript
var readableStream = fs.createReadStream('./path/to/file');

var writableStream = client.upload({
    queueSize: 1, // == default value
    partSize: 5 * 1024 * 1024, // == default value of 5MB
    container: 'web-static',
    remote: 'image.jpg'
});

//writableStream.managedUpload === https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3/ManagedUpload.html
// managedUpload object allows you to abort ongoing upload or track file upload progress.

readableStream.pipe(writableStream)
.on('success', function(file) {
    console.log(file);
}).on('error', function(err) {
    console.log(err);
});
```
