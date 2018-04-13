var helpers = require('../../../helpers'),
    http = require('http'),
    should = require('should'),
    hock = require('hock'),
    mock = !!process.env.MOCK;

describe.skip('pkgcloud/amazon/keys', function () {

  var client, server, hockInstance;

  before(function (done) {
    client = helpers.createClient('amazon', 'compute');

    if (!mock) {
      return done();
    }

    hockInstance = hock.createHock();
    hockInstance.filteringRequestBody(helpers.authFilter);

    // setup a filtering path for aws
    hockInstance.filteringPathRegEx(/https:\/\/ec2\.us-west-2\.amazonaws\.com([?\w\-\.\_0-9\/]*)/g, '$1');

    server = http.createServer(hockInstance.handler);
    server.listen(12345, done);
  });

  it('add KeyPair should succeed', function(done) {

    if (mock) {
      hockInstance
        .post('/', {
          Action: 'ImportKeyPair',
          KeyName: 'unittest',
          PublicKeyMaterial: 'YzNOb0xYSnpZU0JCUVVGQlFqTk9lbUZETVhsak1rVkJRVUZCUkVGUlFVSkJRVUZDUVZGRGJsaGlkR1pHVFROck5FeEZiM2hNYUVOR1EzbHVjbkJpYm10UFlXcGhRMnhGVVZWemRXUmFhekJUVld4VmVubDBZMmxhUmpBck4yNVZhRGcxVkRaalpXTXlOamRuYXpaNFpUQlpXRUpxYWxoV2MyeHFjR3RCVm5JeWMyMXljRlJ3YzJGSldrMXFkWGRQTmxaSE5GZFlNRzU0TkZoSmFHMWxUeTlXY21kdll6WTVRMGxpVEZKcU5ua3lTbEkxVVRsYWFIVnFaVlpKSzFGWlZrZzNSblowT1RaTVpqaDVTa042WXpSUWREWklWQ3N3VTJwdWRubHFTVlpSVGtjcldGVnVTMjFHTVdOVlRHWmlXVFpPSzJKd2JVaEpRV3B4TlcxbUx6UjRUMmxLZUhGVWEwTjBObWhvTkdrNGFFNHZPSEptTXpVd0wwZERVRTFHWVRBMFVtaDJTaTloUVZSV01taHhMelI0VVhaVlVYaHpkelZzV25Vek0zZFpNRU5pUVhJMVozWjJiSFpRZDFnclYwcEZRalEzUlU5YWRFd3JkbTFuWlZkaWVHSkVUR05GTlVWYVNuSXhlakpJVjJaU1FrSXdlQzl1UW5nPQ=='
        }, { 'User-Agent': client.userAgent })
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
        .post('/', {
          Action: 'DeleteKeyPair',
          KeyName: 'unittest'
        }, { 'User-Agent': client.userAgent })
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
        .post('/', { Action: 'DescribeKeyPairs' }, { 'User-Agent': client.userAgent })
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
        .post('/', {
          Action: 'DescribeKeyPairs',
          'KeyName.1': 'unittest'
        }, { 'User-Agent': client.userAgent })
        .replyWithFile(200, __dirname + '/../../../fixtures/amazon/list-keys.xml');
    }

    client.getKey('unittest', function (err, data) {
      should.not.exist(err);
      should.exist(data);
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
