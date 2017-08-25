var server;
var should = require('should'),
    helpers = require('../../helpers'),
    hock = require('hock'),
    http = require('http'),
    mock = !!process.env.MOCK,
    Server = require('../../../lib/pkgcloud/core/compute/server').Server;

var client;
var options = {
    name: 'create-test-oao2',
    flavor: 'S',
    image: '6631A1589A2CC87FEA9B99AB07399281',
    location: 'Germany',
    token: process.env.OAO_TOKEN
};

describe('Server tests', function () {
    this.timeout(18000000);
    var hockInstance, mockServer;
    before(function (done) {
        client = helpers.createClient('oneandone', 'compute');
        if (!mock) {
            client.createServer(options, function (err, srv1) {
                should.not.exist(err);
                should.exist(srv1);
                server = srv1;
                srv1.should.be.instanceOf(Server);
                srv1.name.should.equal('create-test-oao2');
                srv1.image.id.should.equal(options.image);
                done();
            });
        }
        hockInstance = hock.createHock({throwOnUnmatched: false});
        hockInstance.filteringRequestBody(helpers.authFilter);
        mockServer = http.createServer(hockInstance.handler);
        mockServer.listen(12345, done);
    });

    after(function (done) {
        if (hockInstance) {
            mockServer.close(function () {
                done();
            });
        } else {
            client.destroyServer(server, function (err, response) {
                should.not.exist(err);
                should.exist(response);
                done();
            });
        }
    });

    it('the getServers() method should return a list of servers', function (done) {
        if (mock) {
            hockInstance
                .get('/servers')
                .reply(200, helpers.loadFixture('oneandone/listServers.json'));
        }
        client.getServers(function (err, servers) {
            should.not.exist(err);
            should.exist(servers);
            servers.should.be.an.Array;
            servers.forEach(function (srv) {
                srv.should.be.instanceOf(Server);
            });
            hockInstance && hockInstance.done();
            done();
        });
    });

    it('the getServer() method should return a server information', function (done) {
        if (mock) {
            hockInstance
                .get('/servers/39AA65F5D5B02FA02D58173094EBAF95')
                .reply(200, helpers.loadFixture('oneandone/getServer.json'));
        }
        client.getServer(server, function (err, srv1) {
            should.not.exist(err);
            should.exist(srv1);
            srv1.should.be.instanceOf(Server);
            hockInstance && hockInstance.done();
            done();
        });
    });

    it('the rebootServer() method should restart the server', function (done) {
        if (mock) {
            hockInstance
                .get('/servers/39AA65F5D5B02FA02D58173094EBAF95/status/action')
                .reply(200, helpers.loadFixture('oneandone/getServer.json'));
        }
        client.rebootServer(server, function (err, srv1) {
            should.not.exist(err);
            srv1.should.be.instanceOf(Server);
            hockInstance && hockInstance.done();
            done();
        });
    });
});