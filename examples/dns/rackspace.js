var pkgcloud = require('../../lib/pkgcloud');
var _		 = require('underscore');

var rackspace = pkgcloud.dns.createClient({
    provider: 'rackspace',
    username: 'rdodev',
    apiKey: '2706535fb997436b8e9c28db909df003'
  });

// Basic DNS management operations. Please note that due to the asynchronous nature of JS programming,
// the code sample below will cause unexpected results if run as-a-whole and are meant for documentation 
// and illustration purposes.

// 1 - Get all DNS "Zones" associates with your account
rackspace.getZones({}, function (err, zones) {
	if(!err && zones.length > 0) {
		_.each(zones, function (z) { 
			console.log(z.id + ' ' + z.name);
		});
	}
});

// 2 - Create a new "Zone". The details object has these required fields: name, admin email, 
// ttl and comment are optional. *IMPORTANT*: Currently the service will check the domain name you are 
// trying to use is actually registered. If it cannot find a record for it, it will error out.
var details = {name: 'clearthefog.com', email: 'admin@clearthefog.com', ttl: 300, comment: 'I pity .foo'};
rackspace.createZone(details, function (err, zone) {
	if(!err) {
		console.log(zone.id + ' ' + zone.name + ' ' + zone.ttl);
	}
});

// 3 - Let's get the "Zone" we just created and let's see its records
rackspace.getZones({name:'clearthefog.com'}, function (err, zones) {
	if(!err && zones.length > 0) {
		console.log('We have parent Zone');
		rackspace.getRecords(zones[0], function (err, records) {
			if (!err) {
				_.each(records, function (rec){
					console.dir(rec);
				});
			}
			else {
				console.log('There was an error retrieving records: ' + err);
			}
		});
	}
});

// 4 - Let's add a new DNS A-record to a "Zone". Record has three required fields: type, name, data
var _rec = {name: 'sub.clearthefog.com', type: 'A', data: '127.0.0.1'};
rackspace.getZones({name:'clearthefog.com'}, function (err, zones) {
	if(!err && zones.length > 0) {
		console.log('We have parent Zone');
		rackspace.createRecord(zones[0], _rec, function (err, rec) {
			if (!err) {
				console.log('Record successfully created');
				console.log(rec.name + ' ' + rec.data + ' ' + rec.ttl);
			}
		});
	}
});

// 5 - Now let's remove the "Zone" and all of its children records.
rackspace.getZones({name:'clearthefog.com'}, function (err, zones) {
	if(!err && zones.length > 0) {
		console.log('We have parent Zone');
		rackspace.deleteZone(zones[0], function (err) {
			if (!err) {
				console.log('Zone and records were successfully deleted');
			}
			else {
				console.log('There was an error while deleting zone: ' + err);
			}
		});
	}
});