var helpers = require('../../../helpers'),
    http = require('http'),
    should = require('should'),
    hock = require('hock'),
    mock = !!process.env.MOCK;

describe('pkgcloud/amazon/keys', function () {

  var client, server, hockInstance;

  before(function (done) {
    client = helpers.createClient('amazon', 'compute');

    if (!mock) {
      return done();
    }

    hockInstance = hock.createHock();
    hockInstance.filteringRequestBody(helpers.authFilter);

    server = http.createServer(hockInstance.handler);
    server.listen(12345, done);
  });

  it('add KeyPair should succeed', function(done) {

    if (mock) {
      hockInstance
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
      hockInstance && hockInstance.done();
      done();
    });
  });

  it('destroy KeyPair should succeed', function (done) {

    if (mock) {
      hockInstance
        .post('/?Action=DeleteKeyPair', {
          KeyName: 'unittest'
        })
        .replyWithFile(200, __dirname + '/../../../fixtures/amazon/destroy-key.xml');
    }

    client.destroyKey('unittest', function (err, data) {
      should.not.exist(err);
      data.should.equal(true);
      hockInstance && hockInstance.done();
      done();
    });
  });

  it('list KeyPairs should succeed', function (done) {

    if (mock) {
      hockInstance
        .post('/?Action=DescribeKeyPairs', {})
        .replyWithFile(200, __dirname + '/../../../fixtures/amazon/list-keys.xml');
    }

    client.listKeys(function (err, data) {
      should.not.exist(err);
      data.should.be.an.Array;
      hockInstance && hockInstance.done();
      done();
    });
  });

  it('get KeyPair should succeed', function (done) {

    if (mock) {
      hockInstance
        .post('/?Action=DescribeKeyPairs', {
          'KeyName.1': 'unittest'
        })
        .replyWithFile(200, __dirname + '/../../../fixtures/amazon/list-keys.xml');
    }

    client.getKey('unittest', function (err, data) {
      should.not.exist(err);
      // TODO
      hockInstance && hockInstance.done();
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
