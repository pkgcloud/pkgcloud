/**
 * Created by Ali Bazlamit on 8/19/2017.
 */


var image,
    server,
    client;
var should = require('should'),
    helpers = require('../../helpers'),
    hock = require('hock'),
    http = require('http'),
    mock = !!process.env.MOCK,
    Image = require('../../../lib/pkgcloud/core/compute/image').Image;

var srvr_options = {
    name: 'create-test-oao2',
    flavor: '81504C620D98BCEBAA5202D145203B4B',
    image: '6631A1589A2CC87FEA9B99AB07399281',
    location: '4EFAD5836CE43ACA502FD5B99BEE44EF',
};
var image_options = {
    name: 'pkgcloud image2',
    server: '',
    token: process.env.OAO_TOKEN
};

describe('Images tests', function () {
    this.timeout(18000000);
    var hockInstance, mockServer;
    before(function (done) {
        client = helpers.createClient('oneandone', 'compute');
        if (!mock) {
            client.createServer(srvr_options, function (err, srv1) {
                should.not.exist(err);
                should.exist(srv1);
                server = srv1;
                image_options.server = server;
                client.createImage(image_options, function (err, img1) {
                    should.not.exist(err);
                    should.exist(img1);
                    image = img1;
                    done();
                });
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
        }
        else {
            client.destroyServer(server, function (err, response) {
                should.not.exist(err);
                should.exist(response);
                client.destroyImage(image, function (err, deleteResponse) {
                    should.not.exist(err);
                    should.exist(deleteResponse);
                    done();
                });
            });
            done();
        }
    });

    it('the getImages() method should return a list of images', function (done) {
        if (mock) {
            hockInstance
                .get('images/')
                .reply(200, helpers.loadFixture('oneandone/listImages.json'));
        }
        client.getImages(function (err, images) {
            should.not.exist(err);
            should.exist(images);

            images.should.be.an.Array;

            images.forEach(function (img) {
                img.should.be.instanceOf(Image);
            });
            hockInstance && hockInstance.done();
            done();
        });
    });

    it('the getImage() method should return an image information', function (done) {
        if (mock) {
            hockInstance
                .get('images/842F09CAF954298C6A4BCD25E1CA3689')
                .reply(200, helpers.loadFixture('oneandone/getImage.json'));
        }
        client.getImage(image, function (err, response) {
            should.not.exist(err);
            should.exist(response);
            response.should.be.instanceOf(Image);
            hockInstance && hockInstance.done();
            done();
        });
    });
});