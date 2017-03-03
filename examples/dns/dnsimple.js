var pkgcloud = require('../../lib/pkgcloud'),
    _ = require('underscore');

var dnsimple = pkgcloud.dns.createClient({
    provider: 'dnsimple',
    email: 'example@email.com',
    apiKey: '12399087453978'
  });

dnsimple.on('log::*', function(message, object) {
  if (object) {
   //console.log(this.event.split('::')[1] + ' ' + message)
   //console.dir(object);
  }
  else {
    //console.log(this.event.split('::')[1]  + ' ' + message);
  }
});

// 1 - Get a DNS "Zone" associates with your account and a domain
dnsimple.getZone('example.com', function (err, zone) {
  if (err) {
    console.dir(err);
    return;
  }

  console.log(zone.name, zone.nameservers);
});

// 2 - Get all DNS "Zones" associates with your account
dnsimple.getZones(function (err, zones) {
  if (err) {
    console.dir(err);
    return;
  }

  zones.forEach(function (zone) {
    console.log(zone.name, zone.id);
  });
});

// 3 - Get all records with your account for a domain
dnsimple.getRecords('example.com', function (err, records) {
  if (err) {
    console.dir(err);
    return;
  }

  records.forEach(function (record) {
    console.log(record.id, record.name || '-', record.type, record.data);
  });
});

// 4 - Get a record from a specific domain based on an id
dnsimple.getRecord('example.com', '2996500', function (err, record) {
  if (err) {
    console.dir(err);
    return;
  }

  console.log(record.name || '-', record.type, record.data);
});


// 5 - Updated a record for a specific domain
dnsimple.updateRecord('example.com', { id: '3065173', type: 'POOL', name: '' + Math.random(), data: 'ci.example.com' }, function (err, record) {
  if (err) {
    console.dir(err);
    return;
  }

  console.log('!!', record.name || '-', record.type, record.data);
});

// 6 - Create a new record for a specific domain
dnsimple.createRecord('example.com', { type: 'POOL', ttl: 60, name: '' + Math.random(), data: 'ci.example.com' }, function (err, record) {
  if (err) {
    console.dir(err);
    return;
  }

  console.log('create', record.name || '-', record.type, record.data);
  dnsimple.deleteRecord('example.com', record.id, function (err) {
    if (err) {
      console.dir(err);
      return;
    }
    console.log('deleted', record.id, record.name, record.type);
  })
});
