##Using the Openstack Orchestration provider

Creating a client is straight-forward:

``` js
  var openstack = pkgcloud.metering.createClient({
    provider: 'openstack', // required
    username: 'your-user-name', // required
    password: 'your-password', // required
    authUrl: 'your identity service url', // required
    version: 'v2'		//Seemed necessary
  });
```

**Note:** *Due to variances between OpenStack deployments, you may or may not need a `region` option.*

[More options for creating clients](README.md)

### API Methods

## Ceilometer (metering)

**Note** *A lot of extra info on how to make queries etc. can be found on the ceilometer api help pages!
http://docs.openstack.org/developer/ceilometer/webapi/v2.html

### Meters

If you access the ceilometer API, one's always talking about the oldSample object used by the meter methods. This way if thinking has continued in this implementation to keep everything transparent.

#### client.getMeters({options}, callback)
Lists all meters that are available to use on your Openstack account

Callback returns `f(err, meters)` where `meters` is an `Array`
An example of defining options object for filtering, this filter will filter only the meters which are set on the following resource_id:

```js
var options = {
  q: [ 		//q can be an object or an array of filters
  {
  		field: 'resource_id',
  		op: 'eq',
  		value: 'bbc28bf3-c40e-4c45-960a-55af459231b6'
  },
  {
  		...
  }
};

client.getMeters(options, function (err, data) {
    console.log(data);
});
```


#### client.getMeter({options}, callback)
Gets a specific meter

Options are as follows:

```js

var options = {
  meterName: 'hanziesMeter' //The name of the meter, required
  qs: {					//items for the query string (optional)
  	q: {				//Specify some query filters: object or array
  		field: 'resource_id',
  		op: 'eq',
  		value: 'bbc28bf3-c40e-4c45-960a-55af459231b6'
  	}
  }
};

client.getMeter(options, function (err, data) {
    console.log(data);
});
```
Returns the samples for the specific meter in the callback `f(err, sample)`

#### client.createMeter(options, callback)
Create your personal meters (if the meterName doesn't exist) and optionally add samples to this newly created or existing meter.

```js
var options = {
    meterName: 'hanziesMeasurement',	//Required
    samples: [							//Optional
        {
            "counter_name": "hanziesMeasurement",
            "counter_type": "gauge",
            "counter_unit": "%",
            "counter_volume": 17.0,
            "resource_id": "bbc28bf3-c40e-4c45-960a-55af459231b6"
        }
    ]
};

client.createMeter(options, function (err, data) {
    console.log(data);
});
```

#### client.getMeterStats(options, callback)
Get the statistics for the provided meter


```js
var options = {
    meterName: 'hanziesMeasurement',	//Required
    qs: {					//items for the query string (optional)
      	q: {				//Specify some query filters: object or array
      		field: 'resource_id',
      		op: 'eq',
      		value: 'bbc28bf3-c40e-4c45-960a-55af459231b6'
      	}
   }
};

client.getMeterStats(options, function (err, data) {
    console.log(data);
});
```

### Samples

The Api for the samples uses a slightly different sample object (not the oldSample object like metering)

#### client.getSamples(options, callback)
Lists all known samples, based on the data recorded so far.


```js
var options = {
    q : {
        field: 'resource_id',
        op: 'eq',
        value: 'c2f856e4-cdad-4662-b00e-2dd3411716c9-hdd'
    }
};
client.getSamples(options, function (err, data) {
   console.log(data);
});
```

#### client.getSample(options, callback)
Shows a specific sample defined by its own specific ID

```js
client.getSample('abc4301a-4802-11e5-9bec-52540054dbfb', function (err, data) {
    console.log(data);
});
```
