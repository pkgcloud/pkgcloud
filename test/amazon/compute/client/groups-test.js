//var helpers = require('../../../helpers');
//var vows = require('vows');
//var assert = require('assert');
//
//var client = helpers.createClient('amazon', 'compute');
//
//// Tests
//var suite = vows.describe('pkgcloud/amazon/groups').addBatch({
//  'add SecurityGroup': {
//    topic: function () {
//      client.addGroup({
//        name: 'unit test',
//        description: 'unit test'
//      }, this.callback)
//    },
//    'should succeed': function (err, data) {
//      assert.isNull(err);
//      assert.isTrue(data);
//    }
//  },
//  'destroy SecurityGroup': {
//    topic: function () {
//      client.destroyGroup('unit test', this.callback);
//    },
//    'should succeed': function (err, data) {
//      assert.isNull(err);
//      assert.isTrue(data);
//    }
//  },
//  'list SecurityGroups': {
//    topic: function () {
//      client.listGroups(this.callback);
//    },
//    'should succeed': function (err, data) {
//      assert.isNull(err);
//      assert.isArray(data);
//    }
//  },
//  'get SecurityGroup': {
//    topic: function () {
//      client.getGroup('unit test', this.callback);
//    },
//    'should succeed': function (err, data) {
//      assert.isNull(err);
//      // TODO
//    }
//  },
//  'add Rules': {
//    topic: function () {
//      client.addRules({
//        name: 'unit test',
//        rules: {
//          'IpPermissions.1.IpProtocol': 'tcp',
//          'IpPermissions.1.Groups.1.GroupName': 'unit test',
//          'IpPermissions.1.FromPort': 0,
//          'IpPermissions.1.ToPort': 65535
//        }
//      }, this.callback);
//    },
//    'should succeed': function (err, data) {
//      assert.isNull(err);
//      assert.isTrue(data);
//    }
//  },
//  'destroy Rules': {
//    topic: function () {
//      client.delRules({
//        name: 'unit test',
//        rules: {
//          'IpPermissions.1.IpProtocol': 'tcp',
//          'IpPermissions.1.Groups.1.GroupName': 'unit test',
//          'IpPermissions.1.FromPort': 0,
//          'IpPermissions.1.ToPort': 65535
//        }
//      }, this.callback);
//    },
//    'should succeed': function (err, data) {
//      assert.isNull(err);
//      assert.isTrue(data);
//    }
//  }
//});
//
//
//// Mock API answers
//var nock = require('nock');
//nock('https://' + client.serversUrl)
//  .filteringRequestBody(helpers.authFilter)
//  .post('/?Action=CreateSecurityGroup', {
//    GroupDescription: 'unit test',
//    GroupName: 'unit test'
//  })
//  .reply(200, helpers.loadFixture('amazon/add-group.xml'), {})
//  .post('/?Action=DeleteSecurityGroup', {
//    GroupName: 'unit test'
//  })
//  .reply(200, helpers.loadFixture('amazon/destroy-group.xml', {}))
//  .post('/?Action=DescribeSecurityGroups', {})
//  .reply(200, helpers.loadFixture('amazon/list-groups.xml'), {})
//  .post('/?Action=DescribeSecurityGroups', {
//    'GroupName.1': 'unit test'
//  })
//  .reply(200, helpers.loadFixture('amazon/list-group.xml'), {})
//  .post('/?Action=AuthorizeSecurityGroupIngress', {
//    GroupName: 'unit test',
//    'IpPermissions.1.FromPort': '0',
//    'IpPermissions.1.Groups.1.GroupName': 'unit test',
//    'IpPermissions.1.IpProtocol': 'tcp',
//    'IpPermissions.1.ToPort': '65535'
//  })
//  .reply(200, helpers.loadFixture('amazon/add-rules.xml'), {})
//  .post('/?Action=RevokeSecurityGroupIngress', {
//    GroupName: 'unit test',
//    'IpPermissions.1.FromPort': '0',
//    'IpPermissions.1.Groups.1.GroupName': 'unit test',
//    'IpPermissions.1.IpProtocol': 'tcp',
//    'IpPermissions.1.ToPort': '65535'
//  })
//  .reply(200, helpers.loadFixture('amazon/destroy-rules.xml'), {})
//
//suite.export(module);
