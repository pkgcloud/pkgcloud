var helpers = require('../../../helpers'),
    http = require('http'),
    should = require('should'),
    hock = require('hock'),
    mock = !!process.env.MOCK;

describe.skip('pkgcloud/amazon/groups', function () {

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

  it('add SecurityGroup should succeed', function(done) {

    if (mock) {
      hockInstance
        .post('/', {
          Action: 'CreateSecurityGroup',
          GroupDescription: 'unit test',
          GroupName: 'unit test'
        }, { 'User-Agent': client.userAgent })
        .replyWithFile(200, __dirname + '/../../../fixtures/amazon/add-group.xml');
    }

    client.addGroup({
      name: 'unit test',
      description: 'unit test'
    }, function(err, data) {
      should.not.exist(err);
      data.GroupId.should.equal('sg-a6e01ccd');

      hockInstance && hockInstance.done();
      done();
    });
  });

  it('destroy SecurityGroup should succeed', function (done) {

    if (mock) {
      hockInstance
        .post('/', {
          Action: 'DeleteSecurityGroup',
          GroupName: 'unit test'
        }, { 'User-Agent': client.userAgent })
        .replyWithFile(200, __dirname + '/../../../fixtures/amazon/destroy-group.xml');
    }

    client.destroyGroup('unit test', function (err, data) {
      should.not.exist(err);
      data.should.equal(true);
      hockInstance && hockInstance.done();
      done();
    });
  });

  it('list SecurityGroups should succeed', function (done) {

    if (mock) {
      hockInstance
        .post('/', { Action: 'DescribeSecurityGroups'}, { 'User-Agent': client.userAgent })
        .replyWithFile(200, __dirname + '/../../../fixtures/amazon/list-groups.xml');
    }

    client.listGroups(function (err, data) {
      should.not.exist(err);
      data.should.be.an.Array;
      hockInstance && hockInstance.done();
      done();
    });
  });

  it('get SecurityGroup should succeed', function (done) {

    if (mock) {
      hockInstance
        .post('/', {
          Action: 'DescribeSecurityGroups',
          'GroupName.1': 'unit test'
        }, { 'User-Agent': client.userAgent })
        .replyWithFile(200, __dirname + '/../../../fixtures/amazon/list-group.xml');
    }

    client.getGroup('unit test', function (err, data) {
      should.not.exist(err);
      should.exist(data);
      hockInstance && hockInstance.done();
      done();
    });
  });

  it('add Rules should succeed', function(done) {

    if (mock) {
      hockInstance
        .post('/', {
          Action: 'AuthorizeSecurityGroupIngress',
          GroupName: 'unit test',
          'IpPermissions.1.FromPort': '0',
          'IpPermissions.1.Groups.1.GroupName': 'unit test',
          'IpPermissions.1.IpProtocol': 'tcp',
          'IpPermissions.1.ToPort': '65535'
        }, { 'User-Agent': client.userAgent })
        .replyWithFile(200, __dirname + '/../../../fixtures/amazon/add-rules.xml');
    }

    client.addRules({
      name: 'unit test',
      rules: [
        { IpProtocol: 'tcp',
          FromPort: 0,
          UserIdGroupPairs: [ {
              GroupName: 'unit test'
            } ],
          ToPort: 65535
        }
      ]
    }, function(err, data) {
      should.not.exist(err);
      data.should.equal(true);
      hockInstance && hockInstance.done();
      done();
    });
  });

  it('delete Rules should succeed', function (done) {

    if (mock) {
      hockInstance
        .post('/', {
          Action: 'RevokeSecurityGroupIngress',
          GroupName: 'unit test',
          'IpPermissions.1.FromPort': '0',
          'IpPermissions.1.Groups.1.GroupName': 'unit test',
          'IpPermissions.1.IpProtocol': 'tcp',
          'IpPermissions.1.ToPort': '65535'
        }, { 'User-Agent': client.userAgent })
        .replyWithFile(200, __dirname + '/../../../fixtures/amazon/destroy-rules.xml');
    }

    client.delRules({
      name: 'unit test',
      rules:
        [
          { IpProtocol: 'tcp',
            FromPort: 0,
            UserIdGroupPairs: [
              {
                GroupName: 'unit test'
              }
            ],
            ToPort: 65535
          } ]
    }, function (err, data) {
      should.not.exist(err);
      data.should.equal(true);
      hockInstance && hockInstance.done();
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

