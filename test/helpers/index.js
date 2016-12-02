var fs = require('fs'),
    path = require('path'),
    qs = require('querystring'),
    pkgcloud = require('../../lib/pkgcloud');

var helpers = exports;

helpers.createClient = function createClient(provider, service, config) {
  config = config || helpers.loadConfig(provider);
  config.provider = provider;

  // use your key for testing, so our credentials dont need to go in the repo
  if (provider === 'joyent') {
    if (!config.username) {
      if (!config.account) {
        config.account = process.env.SDC_CLI_ACCOUNT;
      }

      if (!config.identity) {
        if (process.env.SDC_CLI_IDENTITY) {
          config.identity = process.env.SDC_CLI_IDENTITY;
        } else {
          config.identity = process.env.HOME + '/.ssh/id_rsa';
        }
      }

      if (!config.keyId) {
        if (process.env.SDC_CLI_KEY_ID) {
          config.keyId = process.env.SDC_CLI_KEY_ID;
        } else {
          config.keyId = 'id_rsa';
        }
      }

      if (config.account) {
        config.keyId = '/' + config.account + '/keys/' + config.keyId;
        config.key   = fs.readFileSync(config.identity,'ascii');
      } else {
        throw new Error('Can\'t test without username and account');
      }
    }
  }
  return pkgcloud[service].createClient(config);
};

helpers.loadConfig = function loadConfig(provider) {
  var basefile = path.join(__dirname, '..', 'configs'),
      content;

  if (process.env.MOCK === 'on') {
    basefile = path.join(basefile, 'mock', provider + '.json');
  }
  else {
    basefile = path.join(basefile, provider + '.json');
  }

  try {
    content = fs.readFileSync(basefile, 'utf8');
  }
  catch (ex) {
    console.log('Error parsing: ' + basefile);
    console.log(ex.message);
    console.log('\nAre you sure that file exists?\n');
    process.exit(1);
  }

  return JSON.parse(content);
};

helpers.fixturePath = function fixturePath(path) {
  return __dirname + '/../fixtures/' + path;
};

helpers.loadFixture = function loadFixture(path, json) {
  var contents = fs.readFileSync(helpers.fixturePath(path), 'ascii');
  return json === 'json'
    ? JSON.parse(contents)
    : contents;
};

helpers.personalityPost = function persPost(pubkey) {
  return JSON.stringify({
    server: {
      name: 'create-personality-test',
      image: 49,
      flavor: 1,
      personality: [{
        path: '/root/.ssh/authorized_keys',
        contents: pubkey.toString('base64')
      }],
      flavorId: 1,
      imageId: 49
    }
  });
};

helpers.selectInstance = function selectInstance(client, callback) {
  function filterInstances(instances) {
    var ready = instances.filter(function (instance) {
      return (instance.status == instance.STATUS.running);
    });
    if (ready.length === 0) {
      console.log('ERROR:   Is necessary have Instances actived for this test.');
    }
    return ready[0];
  }

  client.getInstances(function (err, instances) {
    if (err) {
      throw new Error(err);
    }

    if (instances.length === 0) {
      throw new Error({ message:'No instances found.' });
    }
    callback(filterInstances(instances));
  });
};

helpers.authFilter = function authFilter(body) {
  var data = qs.parse(body);

  delete data.AWSAccessKeyId;
  delete data.Signature;
  delete data.SignatureMethod;
  delete data.SignatureVersion;
  delete data.Timestamp;
  delete data.Version;

  return JSON.stringify(data);
};

helpers.azureResponseHeaders = function azureHeaders(headers) {
  var headers = headers || {};
  headers['last-modified'] = 'Sat, 10 Nov 2012 14:15:36 GMT';
  headers['x-ms-request-id'] = '0ec15c65-970b-4342-bf34-383650212189';
  headers['x-ms-version'] = '2011-08-18';
  headers.etag = '"0x8CF8D64FD4A4B45"';
  headers.server = 'Windows-Azure-Blob/1.0 Microsoft-HTTPAPI/2.0';
  headers.date =  new Date().toUTCString();
  return headers;
};


helpers.azureDeleteResponseHeaders = function azureHeaders(headers) {
  var headers = headers || {};
  headers['x-ms-request-id'] = '0ec15c65-970b-4342-bf34-383650212189';
  headers['x-ms-version'] = '2011-08-18';
  headers.server = 'Windows-Azure-Blob/1.0 Microsoft-HTTPAPI/2.0';
  headers.date =  new Date().toUTCString();
  return headers;
};

helpers.azureGetFileResponseHeaders = function azureHeaders(headers) {
  var headers = headers || {};
  headers['accept-ranges'] = 'bytes';
  headers['x-ms-lease-status'] = 'unlocked';
  headers['x-ms-blob-type'] = 'BlockBlob';
  headers['last-modified'] = 'Sat, 10 Nov 2012 14:15:36 GMT';
  headers['x-ms-request-id'] = '0ec15c65-970b-4342-bf34-383650212189';
  headers['x-ms-version'] = '2011-08-18';
  headers.etag = '"0x8CF8D64FD4A4B45"';
  headers.server = 'Windows-Azure-Blob/1.0 Microsoft-HTTPAPI/2.0';
  headers.date =  new Date().toUTCString();
  return headers;
};

helpers.rackspaceResponseHeaders = function rackspaceHeaders(headers) {
  var headers = headers || {};
  headers['X-Trans-Id'] = 'tx30f4a35cd9c8491abd4d5bd484a437eb';
  headers.date =  new Date().toUTCString();
  return headers;
};

helpers.getRackspaceAuthResponse = function(time) {
  return helpers._getOpenstackStandardResponse('../fixtures/rackspace/auth.json', time);
};

helpers.getOpenstackAuthResponse = function (time) {
  return helpers._getOpenstackStandardResponse('../fixtures/openstack/realToken.json', time);
};

helpers.gethpAuthResponse = function (time) {
  return helpers._getOpenstackStandardResponse('../fixtures/hp/realToken.json', time);
};

helpers._getOpenstackStandardResponse = function(file, time) {
  if (!time) {
    time = new Date(new Date().getTime() + (1000 * 60 * 60 * 24));
  }

  var response = require(file);

  response.access.token.expires = time.toString();

  return response;
};

helpers.setupAuthenticationMock = function (authHockInstance, provider) {
  if (provider === 'rackspace') {
        authHockInstance
          .post('/v2.0/tokens', {
            auth: {
              'RAX-KSKEY:apiKeyCredentials': {
                username: 'MOCK-USERNAME',
                apiKey: 'MOCK-API-KEY'
              }
            }
          })
          .reply(200, helpers.getRackspaceAuthResponse());
    }
    else if (provider === 'openstack')   {
      authHockInstance
        .post('/v2.0/tokens', {
          auth: {
            passwordCredentials: {
              username: 'MOCK-USERNAME',
              password: 'MOCK-PASSWORD'
            }
          }
        })
        .replyWithFile(200, __dirname + '/../fixtures/openstack/initialToken.json')
        .get('/v2.0/tenants')
        .replyWithFile(200, __dirname + '/../fixtures/openstack/tenantId.json')
        .post('/v2.0/tokens', {
          auth: {
            passwordCredentials: {
              username: 'MOCK-USERNAME',
              password: 'MOCK-PASSWORD'
            },
            tenantId: '72e90ecb69c44d0296072ea39e537041'
          }
        })
        .reply(200, helpers.getOpenstackAuthResponse());
    }
    else if (provider === 'hp') {
      authHockInstance.post('/v2.0/tokens', {
        auth: {
          apiAccessKeyCredentials: {
            accessKey: 'MOCK-USERNAME',
            secretKey: 'MOCK-API-KEY'
          }
        }
      })
      .replyWithFile(200, __dirname + '/../fixtures/hp/initialToken.json')
      .get('/v2.0/tenants')
      .replyWithFile(200, __dirname + '/../fixtures/hp/tenantId.json')
      .post('/v2.0/tokens', {
        auth: {
          apiAccessKeyCredentials: {
            accessKey: 'MOCK-USERNAME',
            secretKey: 'MOCK-API-KEY'
          },
          tenantId: '5ACED3DC3AA740ABAA41711243CC6949'
        }
      })
      .reply(200, helpers.gethpAuthResponse());
    }
    else {
      throw new Error('provider ['+provider+'] not supported');
    }
};

helpers.pkgcloud = pkgcloud;
