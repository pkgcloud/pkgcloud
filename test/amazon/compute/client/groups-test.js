var helpers = require('../../../helpers'),
    should = require('should'),
    hock = require('hock'),
    mock = !!process.env.NOCK;

describe('pkgcloud/amazon/groups', function () {

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

  it('add SecurityGroup should succeed', function(done) {

    if (mock) {
      server
        .post('/?Action=CreateSecurityGroup', {
          GroupDescription: 'unit test',
          GroupName: 'unit test'
        })
        .replyWithFile(200, __dirname + '/../../../fixtures/amazon/add-group.xml');
    }

    client.addGroup({
      name: 'unit test',
      description: 'unit test'
    }, function(err, data) {
      should.not.exist(err);
      data.should.equal(true);
      server && server.done();
      done();
    });
  });

  it('destroy SecurityGroup should succeed', function (done) {

    if (mock) {
      server
        .post('/?Action=DeleteSecurityGroup', {
          GroupName: 'unit test'
        })
        .replyWithFile(200, __dirname + '/../../../fixtures/amazon/destroy-group.xml');
    }

    client.destroyGroup('unit test', function (err, data) {
      should.not.exist(err);
      data.should.equal(true);
      server && server.done();
      done();
    });
  });

  it('list SecurityGroups should succeed', function (done) {

    if (mock) {
      server
        .post('/?Action=DescribeSecurityGroups', {})
        .replyWithFile(200, __dirname + '/../../../fixtures/amazon/list-groups.xml');
    }

    client.listGroups(function (err, data) {
      should.not.exist(err);
      data.should.be.instanceOf(Array);
      server && server.done();
      done();
    });
  });

  it('get SecurityGroup should succeed', function (done) {

    if (mock) {
      server
        .post('/?Action=DescribeSecurityGroups', {
          'GroupName.1': 'unit test'
        })
        .replyWithFile(200, __dirname + '/../../../fixtures/amazon/list-group.xml');
    }

    client.getGroup('unit test', function (err, data) {
      should.not.exist(err);
      // TODO
      server && server.done();
      done();
    });
  });

  it('add Rules should succeed', function(done) {

    if (mock) {
      server
        .post('/?Action=AuthorizeSecurityGroupIngress', {
          GroupName: 'unit test',
          'IpPermissions.1.FromPort': '0',
          'IpPermissions.1.Groups.1.GroupName': 'unit test',
          'IpPermissions.1.IpProtocol': 'tcp',
          'IpPermissions.1.ToPort': '65535'
        })
        .replyWithFile(200, __dirname + '/../../../fixtures/amazon/add-rules.xml');
    }

    client.addRules({
      name: 'unit test',
      rules: {
        'IpPermissions.1.IpProtocol': 'tcp',
        'IpPermissions.1.Groups.1.GroupName': 'unit test',
        'IpPermissions.1.FromPort': 0,
        'IpPermissions.1.ToPort': 65535
      }
    }, function(err, data) {
      should.not.exist(err);
      data.should.equal(true);
      server && server.done();
      done();
    });
  });

  it('delete Rules should succeed', function (done) {

    if (mock) {
      server
        .post('/?Action=RevokeSecurityGroupIngress', {
          GroupName: 'unit test',
          'IpPermissions.1.FromPort': '0',
          'IpPermissions.1.Groups.1.GroupName': 'unit test',
          'IpPermissions.1.IpProtocol': 'tcp',
          'IpPermissions.1.ToPort': '65535'
        })
        .replyWithFile(200, __dirname + '/../../../fixtures/amazon/destroy-rules.xml');
    }

    client.delRules({
      name: 'unit test',
      rules: {
        'IpPermissions.1.IpProtocol': 'tcp',
        'IpPermissions.1.Groups.1.GroupName': 'unit test',
        'IpPermissions.1.FromPort': 0,
        'IpPermissions.1.ToPort': 65535
      }
    }, function (err, data) {
      should.not.exist(err);
      data.should.equal(true);
      server && server.done();
      done();
    });
  });

  after(function(done) {
    if (!mock) {
      return done();
    }

    server.close(done);
  });
});

