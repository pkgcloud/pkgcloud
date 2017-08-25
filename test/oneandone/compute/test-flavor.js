/**
 * Created by Ali Bazlamit on 8/21/2017.
 */
var should = require('should'),
    async = require('async'),
    helpers = require('../../helpers'),
    hock = require('hock'),
    http = require('http'),
    mock = true,
    Flavor = require('../../../lib/pkgcloud/core/compute/flavor').Flavor;

var flavors = [],
    client;
var options = {
    token: process.env.OAO_TOKEN
};
describe('Flavor tests', function () {
    this.timeout(18000000);
    var authHockInstance, hockInstance, authServer, mockServer;

    before(function (done) {
        client = helpers.createClient('oneandone', 'compute', options);
        if (!mock) {
            return done();
        }
        hockInstance = hock.createHock({throwOnUnmatched: false});
        authHockInstance = hock.createHock();
        mockServer = http.createServer(hockInstance.handler);
        authServer = http.createServer(authHockInstance.handler);
        async.parallel([
            function (next) {
                mockServer.listen(12345, next);
            },
            function (next) {
                authServer.listen(12346, next);
            }
        ], done);
    });

    after(function (done) {
        if (!mock) {
            return done();
        }

        async.parallel([
            function (next) {
                mockServer.close(next);
            },
            function (next) {
                authServer.close(next);
            }
        ], done);
    });


    it('the getFlavors() method should return the list of flavors', function (done) {
        if (mock) {
            hockInstance
                .get('/servers/fixed_instance_sizes')
                .reply(200, helpers.loadFixture('oneandone/listFlavors.json'));
        }
        client.getFlavors(function (err, _flavors) {
            should.exist(_flavors);
            _flavors.should.be.an.Array;
            _flavors.forEach(function (flavor) {
                flavor.should.be.instanceOf(Flavor);
            });
            flavors = _flavors;
            hockInstance && hockInstance.done();
            done();
        });
    });

    it('the getFlavor() method should return a valid flavor', function (done) {
        if (mock) {
            hockInstance
                .get('/servers/fixed_instance_sizes/8C626C1A7005D0D1F527143C413D461E')
                .reply(200, helpers.loadFixture('oneandone/getFlavor.json'));
        }
        client.getFlavor(flavors[0], function (err, flavor) {
            should.not.exist(err);
            should.exist(flavor);
            flavor.should.be.instanceOf(Flavor);
            flavor.id.should.equal(flavors[0].id);
            hockInstance && hockInstance.done();
            done();
        });
    });
});


