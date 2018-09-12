## Using the Rackspace DNS provider

* Zone
  * [Model](#zone-model)
  * [APIs](#zone-apis)
* Record
  * [Model](#record-model)
  * [APIs](#record-apis)

Creating a client is straight-forward:

``` js
  // Rackspace Cloud DNS is a global service, so no region is required

  var rackspace = pkgcloud.dns.createClient({
    provider: 'rackspace', // required
    username: 'your-user-name', // required
    apiKey: 'your-api-key', // required
    useInternal: false // optional, use to talk to serviceNet from a Rackspace machine
  });
```

Learn about [more options for creating clients](README.md) in the Rackspace `dns` provider.

### Zone Model

A Zone for Rackspace DNS has following properties:

```Javascript
{
  id: 12345678, // Rackspace ID of your dns zone
  name: 'example.com', // the domain name for the zone
  nameservers: [
    {
      name: 'dns1.stabletransit.com'
    },
    {
      name: 'dns2.stabletransit.com'
    }
  ], // the nameservers for the zone
  emailAddress: 'hostmaster@example.com', // the SOA contact email address
  created: '2013-07-31T16:21:33.000Z',
  updated: '2013-07-31T16:21:33.000Z'
}
```

### Record Model

A Record for Rackspace DNS has the following properties:

```Javascript
{
    id: 'A-12345', // The Rackspace ID for the record
    name: 'www.example.com', // The DNS record
    type: 'A', // The type of record
    ttl: 3600, // TTL of the record, in seconds
    data: '192.168.10.10', // Data for the record
    created: '2013-07-31T16:21:33.000Z',
    updated: '2013-07-31T16:21:33.000Z'
}
```

### Zone APIs

* [`client.getZones(details, function(err, zones) { })`](#clientgetzonesdetails-functionerr-zones--)
* [`client.getZone(zone, function(err, zone) { })`](#clientgetzonezone-functionerr-zone--)
* [`client.createZone(zone, function(err, zone) { })`](#clientcreatezonezone-functionerr-zone--)
* [`client.createZones(zones, function(err, zones) { })`](#clientcreatezoneszones-functionerr-zones--)
* [`client.importZone(details, function(err, zone) { })`](#clientimportzonezone-functionerr-zone--)
* [`client.exportZone(zone, function(err, result) { })`](#clientexportzonezone-functionerr-result--)
* [`client.updateZone(zone, function(err) { })`](#clientupdatezonezone-functionerr--)
* [`client.updateZones(zones, function(err) { })`](#clientupdatezoneszones-functionerr--)
* [`client.deleteZone(zone, function(err) { })`](#clientdeletezonezone-functionerr--)
* [`client.deleteZones(zones, function(err) { })`](#clientdeletezonesszones-functionerr-)
* [`client.getZoneChanges(zone, options, function(err, changes) { })`](#clientgetzonechangeszone-options-functionerr-changes--)
* [`client.cloneZone(zone, options, function(err, zone) { })`](#clientclonezonezone-options-functionerr-zone--)
* [`client.getSubZones(zone, function(err, zones) { })`](#clientgetsubzoneszone-functionerr-zones--)

### Zone API Details

For all of the zone methods that require a zone, you can pass either an instance of a [`zone`](#zone-model) or the zone id as `zone`. For example:

```Javascript
client.getZone(12345678, function(err, zone) { ... });
```

This call is functionally equivalent to:

```Javascript
var myZone = new Zone({ id: 12345 });

client.getZone(myZone, function(err, zone) { ... });
```

#### client.getZones(details, function(err, zones) { })

Retrieves the zones for the current client instance as an array of [`zone`](#zone-model)

#### client.getZone(zone, function(err, zone) { })

Retrieves the specified [`zone`](#zone-model) from the current client instance.

#### client.createZone(zone, function(err, zone) { })

Creates a new [`zone`](#zone-model) with attributes from the argument `zone`:

```javascript
client.createZone({
 name: 'example.org', // required
 email: 'hostmaster@example.org', // required, contact email for SOA
 ttl: 300, // optional, default ttl in seconds for records on this domain
 comment: 'my domain for examples' // optional comment
 }, function(err, zone) {
  // ...
 })
```

#### client.createZones(zones, function(err, zone) { })

Batch creates multiple [`zones`](#zone-model) from any array of `zones`. Each zone should have the same properties as referenced in `createZone`.

```javascript
client.createZones([{
 name: 'example.org', // required
 email: 'hostmaster@example.org', // required, contact email for SOA
 ttl: 300, // optional, default ttl in seconds for records on this domain
 comment: 'my domain for examples' // optional comment
 }], function(err, zones) {
  // ...
 })
```

### Record APIs

* [`client.getRecords(zone, function (err, records) { })`](#clientgetrecordszone-functionerr-records--)
* [`client.getRecord(zone, function (err, records) { })`](#clientgetrecordzone-functionerr-record--)
* [`client.createRecord(zone, function (err, records) { })`](#clientcreaterecordzone-functionerr-record--)
* [`client.updateRecord(zone, function (err, records) { })`](#clientupdaterecordzone-functionerr-record--)
* [`client.updateRecord(zone, function (err, records) { })`](#clientdeleterecordzone-functionerr-record--)
