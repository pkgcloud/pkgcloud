var helpers = require('../../../helpers');
var vows = require('vows');
var assert = require('assert');

var client = helpers.createClient('amazon', 'compute');

// Tests
var suite = vows.describe('[Amazon Client] KeyPair management');

suite.addBatch({
    'add KeyPair': {
        topic: function() {
            client.addKey({
                name: 'unittest',
                key: 'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQCnXbtfFM3k4LEoxLhCFCynrpbnkOajaClEQUsudZk0SUlUzytciZF0+7nUh85T6cec267gk6xe0YXBjjXVsljpkAVr2smrpTpsaIZMjuwO6VG4WX0nx4XIhmeO/Vrgoc69CIbLRj6y2JR5Q9ZhujeVI+QYVH7Fvt96Lf8yJCzc4Pt6HT+0SjnvyjIVQNG+XUnKmF1cULfbY6N+bpmHIAjq5mf/4xOiJxqTkCt6hh4i8hN/8rf350/GCPMFa04RhvJ/aATV2hq/4xQvUQxsw5lZu33wY0CbAr5gvvlvPwX+WJEB47EOZtL+vmgeWbxbDLcE5EZJr1z2HWfRBB0x/nBx'
            }, this.callback)
        },
        'should succeed': function(err, data) {
            assert.isNull(err);
            assert.isTrue(data);
        }
    },
    'destroy KeyPair': {
        topic: function() {
            client.destroyKey('unittest', this.callback);
        },
        'should succeed': function(err, data) {
            assert.isNull(err);
            assert.isTrue(data);
        }
    },
    'list KeyPairs': {
        topic: function() {
            client.listKeys(this.callback);
        },
        'should succeed': function(err, data) {
            assert.isNull(err);
            assert.isArray(data);
        }
    },
    'get KeyPair': {
        topic: function() {
            client.getKey('unittest', this.callback);
        },
        'should succeed': function(err, data) {
            assert.isNull(err);
            // TODO
        }
    }
});


// Mock API answers
var nock = require('nock');
nock('https://' + client.serversUrl)
    .filteringRequestBody(helpers.authFilter)
    .post('/?Action=CreateKeyPair', {
        KeyName: 'unittest',
        PublicKeyMaterial: 'c3NoLXJzYSBBQUFBQjNOemFDMXljMkVBQUFBREFRQUJBQUFCQVFDblhidGZGTTNrNExFb3hMaENGQ3lucnBibmtPYWphQ2xFUVVzdWRaazBTVWxVenl0Y2laRjArN25VaDg1VDZjZWMyNjdnazZ4ZTBZWEJqalhWc2xqcGtBVnIyc21ycFRwc2FJWk1qdXdPNlZHNFdYMG54NFhJaG1lTy9WcmdvYzY5Q0liTFJqNnkySlI1UTlaaHVqZVZJK1FZVkg3RnZ0OTZMZjh5SkN6YzRQdDZIVCswU2pudnlqSVZRTkcrWFVuS21GMWNVTGZiWTZOK2JwbUhJQWpxNW1mLzR4T2lKeHFUa0N0NmhoNGk4aE4vOHJmMzUwL0dDUE1GYTA0Umh2Si9hQVRWMmhxLzR4UXZVUXhzdzVsWnUzM3dZMENiQXI1Z3Z2bHZQd1grV0pFQjQ3RU9adEwrdm1nZVdieGJETGNFNUVaSnIxejJIV2ZSQkIweC9uQng='
    })
    .reply(200, helpers.loadFixture('amazon/add-key.xml'), {})
    .post('/?Action=DeleteKeyPair', {
        KeyName: 'unittest'
    })
    .reply(200, helpers.loadFixture('amazon/destroy-key.xml', {}))
    .post('/?Action=DescribeKeyPairs', {})
    .reply(200, helpers.loadFixture('amazon/list-keys.xml'), {})
    .post('/?Action=DescribeKeyPairs', {
        'KeyName.1': 'unittest'
    })
    .reply(200, helpers.loadFixture('amazon/list-keys.xml'), {})

suite.export(module);
