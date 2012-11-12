# pkgcloud 

pkgcloud is a standard library for node.js that abstracts away differences among multiple cloud providers.

* [Unified Vocabulary](#unified-vocabulary)
* [Services](#components)
  * [Compute](#compute)
    * [Creating Compute Clients](#creating-compute-clients)
    * [Server](#server)
    * [Image](#image)
    * [Flavor](#flavor)
  * [Storage](#storage)
    * [Creating Storage Clients](#creating-storage-clients)
    * [Container](#container)
    * [Uploading Files](#uploading)
    * [Downloading Files](#downloading)
  * [Database](#database)
    * [Creating Storage Clients](#creating-storage-clients)
* [Roadmap](#next-steps)

<a name="Unified Vocabulary"></a>
## Unified Vocabulary

When considering all IaaS providers as a whole their vocabulary is somewhat disjoint. `pkgcloud` attempts to overcome this through a unified vocabulary. Note that all Database providers use the same vocabulary: _database_.

### Compute

<table>
  <tr>
    <th>pkgcloud</th>
    <th>OpenStack</th>
    <th>Joyent</th>
    <th>Amazon</th>
    <th>Azure</th>
  </tr>
  <tr>
    <td>Server</td>
    <td>Server</td>
    <td>Machine</td>
    <td>Instance</td>
    <td>Virtual Machine</td>
  </tr>
  <tr>
    <td>Image</td>
    <td>Image</td>
    <td>Dataset</td>
    <td>AMI</td>
    <td>Image</td>
  </tr>
  <tr>
    <td>Flavor</td>
    <td>Flavor</td>
    <td>Package</td>
    <td>InstanceType</td>
    <td>RoleSize</td>
  </tr>
</table>

### Storage

<table>
  <tr>
    <th>pkgcloud</th>
    <th>OpenStack</th>
    <th>Amazon</th>
    <th>Azure</th>
  </tr>
  <tr>
    <td>Container</td>
    <td>Container</td>
    <td>Bucket</td>
    <td>Container</td>
  </tr>
  <tr>
    <td>File</td>
    <td>StorageObject</td>
    <td>Object</td>
    <td>Blob</td>
  </tr>
</table>

<a name="services"></a>
## Services

Currently there are several service types which are handled by pkgcloud:

* [Compute](#compute)
* [Storage](#storage)
* [Database](#database)

<a name="compute"></a>
### Compute

<a name="creating-compute-clients"></a>
#### Creating Compute Clients
The options to be passed to the `pkgcloud.compute.Client` object should be:

**Rackspace**

``` js
  var rackspace = pkgcloud.compute.createClient({
    provider: 'rackspace',
    username: 'nodejitsu',
    apiKey: 'foobar'
  });
```

**Amazon**

``` js
  var amazon = pkgcloud.compute.createClient({
    provider: 'amazon',
    accessKey: 'asdfkjas;dkj43498aj3n',
    accessKeyId: '98kja34lkj'
  });
```
**Azure**

``` js
  var azure = pkgcloud.compute.createClient({
    provider: 'azure',
    storageAccount: "test-storage-account",
    storageAccountKey: "test-storage-account-key",
    managementCertificate: "./test/fixtures/azure/cert/management/management.pem",
    subscriptionId: "azure-account-subscription-id",
    azure: {
        location: "East US",	//azure location for server
        username: "pkgcloud",	//username for server
        password: "Pkgcloud!!",	//password for server
        ssh : {					//ssh settings for linux server
            port: 22,			//default is 22
            pem: "./test/fixtures/azure/cert/ssh/mycert.pem",
            pemPassword: ""
        },
        rdp : {					// rdp settings for windows server
            port: 3389
        }
	});
```

**Azure Account Settings**

**storageAccount:** Azure storage account must already exist. Storage account must be in same Azure location as compute servers (East US, West US, etc.). storageAccount name is obtained from the Storage section of the [Azure Portal] (https://manage.windowsazure.com/#Workspace/StorageExtension/storage).

**storageAccountKey:** Azure storage account access key. storageAccountKey is obtained from the Storage section of the [Azure Portal] (https://manage.windowsazure.com/#Workspace/StorageExtension/storage).

**managementCertificate:** See [Azure Management Certificates](#AzureManageCert).

**subscriptionId:** The subscription ID of your Azure account obtained from the Administrators section of the [Azure Portal] (https://manage.windowsazure.com/#Workspace/AdminTasks/ListUsers).

**Azure Specific Settings**

**azure.location:** Location of storage account and Azure compute servers (East US, West US, etc.). Storage account and compute servers need to be in same location.

**azure.username:** The administrator username used to log into the Azure virtual machine. For Windows servers, this field is ignored and administrator is used for the username.

**azure.password:** The administrator password.


**azure.ssh.port:** The port to use for SSH on Linux servers.

**azure.ssh.pem:** The X509 certificate with a 2048-bit RSA keypair. Specify the path to this pem file. See [Azure x.509 SSH Certificates](#AzureSSHCert).

**azure.ssh.pemPassword:** The password/pass phrase used when creating the pem file. See [Azure x.509 SSH Certificates](#AzureSSHCert).

**azure.rdp.port:** The port to use for RDP on Windows servers.

<br>
**Joyent**

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

<a name="server"></a>
#### Server
* `client.getServers(function (err, servers) { })`
* `client.createServer(options, function (err, server) { })`
* `client.destroyServer(serverId, function (err, server) { })`
* `client.getServer(serverId, function (err, server) { })`
* `client.rebootServer(server, function (err, server) { })`

<a name="image"></a>
#### Image
* `client.getImages(function (err, images) { })`
* `client.getImage(imageId, function (err, image) { })`
* `client.destroyImage(image, function (err, ok) { })`
* `client.createImage(options, function (err, image) { })`

<a name="flavor"></a>
#### Flavor
* `client.getFlavors(function (err, flavors) { })`
* `client.getFlavor(flavorId, function (err, flavor) { })`

<a name="storage"></a>
### Storage

<a name="creating-storage-clients"></a>
#### Creating Storage Clients
The options to be passed to the `pkgcloud.storage.Client` object should be:

**Rackspace**

``` js
  {
    provider: 'rackspace', // 'cloudservers'
    username: 'nodejitsu',
    apiKey: 'foobar'
  }
```

**AWS**

``` js
  {
    provider: 'amazon', // 'aws', 's3'
    accessKey: 'asdfkjas;dkj43498aj3n',
    accessKeyId: '98kja34lkj'
  }
```

**Azure**

``` js
  {
    provider: 'azure',
    storageAccount: "test-storage-account",
    storageAccountKey: "test-storage-account-key"
  }
  
Note: Azure storage account must already exist. Storage account must be in same Azure location as compute servers (East US, West US, etc.). storageAccount and storageAccountKey are obtained from the Storage section of the Azure Portal at:

	https://manage.windowsazure.com/#Workspace/StorageExtension/storage

```
* **pkgcloud.storage.create(options, callback)**
* **new pkgcloud.storage.Client(options, callback)**


<a name="AzureManageCert"></a>
## Azure Management Certificates

#####Create an Azure Service Management certificate on Linux/Mac OSX:

1. Create rsa private key

	openssl genrsa -out management.key 2048

2. Create self signed certificate

	openssl req -new -key management.key -out management.csr

3. Create temp x509 pem file from rsa key and self signed certificate

	openssl x509 -req -days 3650 -in management.csr -signkey management.key -out temp.pem

4. Create management pem from temp pem file and rsa key file. This will be the managementCertificate file used by the compute client in pkgcloud.

	cat management.key temp.pem > management.pem. 
	

5. Create management pfx

	openssl pkcs12 -export -out management.pfx -in temp.pem -inkey management.key -name "My Certificate"

6. Create management cer. This will be the managementCertificate .cer file you need to upload to the Management Certificates section of the Azure portal. https://manage.windowsazure.com/#Workspace/AdminTasks/ListManagementCertificates

7. Secure files

	chmod 600 *.*

#####Create an Azure Service Management certificate from a .publishsettings file:

https://www.windowsazure.com/en-us/manage/linux/common-tasks/manage-certificates/

	
#####Create an Azure Service Management certificate on Windows:

http://msdn.microsoft.com/en-us/library/windowsazure/gg551722.aspx

<a name="AzureSSHCert"></a>
## Azure x.509 SSH Certificates

#####Create an Azure x.509 SSH certificate on Linux/Mac OSX:

1. Create x.509 pem file and key file
	
	openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout myPrivateKey.key -out mycert.pem

2. Change the permissions on the private key and certificate for security.

	chmod 600 mycert.pem	
	chmod 600 myPrivateKey.key
	
3. Specify the path to mycert.pem in the azure.ssh.pem config property when creating an Azure pkgcloud compute client.

4. If you specified a password when creating the pem file, add the password to the azure.ssh.pemPassword config property when creating an Azure pkgcloud compute client.

5. When connecting with ssh to a running Azure compute server, specify the path to myPrivateKey.key.
 
	ssh -i  myPrivateKey.key -p <port> username@servicename.cloudapp.net

For more info: 

https://www.windowsazure.com/en-us/manage/linux/how-to-guides/ssh-into-linux/

<a name="roadmap"></a>
## Roadmap

1. Add support for additional IaaS providers (Azure, etc)
2. Backport latest fixes from `node-cloudfiles` and `node-cloudservers`
3. * **pkgcloud.storage.create(options, callback)**
* **new pkgcloud.storage.Client(options, callback)**

#### Author: [Nodejitsu](http://nodejitsu.com)
#### License: MIT