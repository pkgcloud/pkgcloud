var helpers = require('../../../helpers'),
  should = require('should'),
  hock = require('hock'),
  mock = !!process.env.NOCK;

describe('pkgcloud/amazon/keys', function () {

  var client, server;

  before(function (done) {
    client = helpers.createClient('amazon', 'compute');

    if (!mock) {
      return done();
    }

    hock.createHock(12345, function (err, hockClient) {
      should.not.exist(err);
      should.exist(hockClient);

      server = hockClient.filteringRequestBody(helpers.authFilter);

      done();
    });
  });

  it('add KeyPair should succeed', function(done) {

    if (mock) {
      server
        .post('/?Action=ImportKeyPair', {
          KeyName: 'unittest',
          PublicKeyMaterial: 'c3NoLXJzYSBBQUFBQjNOemFDMXljMkVBQUFBREFRQUJBQUFCQVFDblhidGZGTTNrNExFb3hMaENGQ3lucnBibmtPYWphQ2xFUVVzdWRaazBTVWxVenl0Y2laRjArN25VaDg1VDZjZWMyNjdnazZ4ZTBZWEJqalhWc2xqcGtBVnIyc21ycFRwc2FJWk1qdXdPNlZHNFdYMG54NFhJaG1lTy9WcmdvYzY5Q0liTFJqNnkySlI1UTlaaHVqZVZJK1FZVkg3RnZ0OTZMZjh5SkN6YzRQdDZIVCswU2pudnlqSVZRTkcrWFVuS21GMWNVTGZiWTZOK2JwbUhJQWpxNW1mLzR4T2lKeHFUa0N0NmhoNGk4aE4vOHJmMzUwL0dDUE1GYTA0Umh2Si9hQVRWMmhxLzR4UXZVUXhzdzVsWnUzM3dZMENiQXI1Z3Z2bHZQd1grV0pFQjQ3RU9adEwrdm1nZVdieGJETGNFNUVaSnIxejJIV2ZSQkIweC9uQng='
        })
        .replyWithFile(200, __dirname + '/../../../fixtures/amazon/add-key.xml');
    }

    client.addKey({
      name: 'unittest',
      key: 'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQCnXbtfFM3k4LEoxLhCFCynrpbnkOajaClEQUsudZk0SUlUzytciZF0+7nUh85T6cec267gk6xe0YXBjjXVsljpkAVr2smrpTpsaIZMjuwO6VG4WX0nx4XIhmeO/Vrgoc69CIbLRj6y2JR5Q9ZhujeVI+QYVH7Fvt96Lf8yJCzc4Pt6HT+0SjnvyjIVQNG+XUnKmF1cULfbY6N+bpmHIAjq5mf/4xOiJxqTkCt6hh4i8hN/8rf350/GCPMFa04RhvJ/aATV2hq/4xQvUQxsw5lZu33wY0CbAr5gvvlvPwX+WJEB47EOZtL+vmgeWbxbDLcE5EZJr1z2HWfRBB0x/nBx'
    }, function(err, data) {
      should.not.exist(err);
      data.should.equal(true);
      server && server.done();
      done();
    });
  });

  it('destroy KeyPair should succeed', function (done) {

    if (mock) {
      server
        .post('/?Action=DeleteKeyPair', {
          KeyName: 'unittest'
        })
        .replyWithFile(200, __dirname + '/../../../fixtures/amazon/destroy-key.xml');
    }

    client.destroyKey('unittest', function (err, data) {
      should.not.exist(err);
      data.should.equal(true);
      server && server.done();
      done();
    });
  });

  it('list KeyPairs should succeed', function (done) {

    if (mock) {
      server
        .post('/?Action=DescribeKeyPairs', {})
        .replyWithFile(200, __dirname + '/../../../fixtures/amazon/list-keys.xml');
    }

    client.listKeys(function (err, data) {
      should.not.exist(err);
      data.should.be.instanceOf(Array);
      server && server.done();
      done();
    });
  });

  it('get KeyPair should succeed', function (done) {

    if (mock) {
      server
        .post('/?Action=DescribeKeyPairs', {
          'KeyName.1': 'unittest'
        })
        .replyWithFile(200, __dirname + '/../../../fixtures/amazon/list-keys.xml');
    }

    client.getKey('unittest', function (err, data) {
      should.not.exist(err);
      // TODO
      server && server.done();
      done();
    });
  });

  after(function (done) {
    if (!mock) {
      return done();
    }

    server.close(done);
  });
});


//  'list KeyPairs': {
//    topic: function () {
//      client.listKeys(this.callback);
//    },
//    'should succeed': function (err, data) {
//      assert.isNull(err);
//      assert.isArray(data);
//    }
//  },
//  'get KeyPair': {
//    topic: function () {
//      client.getKey('unittest', this.callback);
//    },
//    'should succeed': function (err, data) {
//      assert.isNull(err);
//      // TODO
//    }
//  }
//});
//
//

//  .post('/?Action=DescribeKeyPairs', {})
//  .reply(200, helpers.loadFixture('amazon/list-keys.xml'), {})
//  .post('/?Action=DescribeKeyPairs', {
//    'KeyName.1': 'unittest'
//  })
//  .reply(200, helpers.loadFixture('amazon/list-keys.xml'), {})
//
//suite.export(module);
