/*
* client-test.js: Tests for pkgcloud HP client functionality.
*
* (C) 2014 Phani Raj.
*
*/

var pkgcloud = require('../../../lib/pkgcloud');

describe('pkgcloud/hp/client', function () {

  describe('Region validation', function () {
    it('User should specify authUrl: compute client', function() {
      (function () {
          pkgcloud.compute.createClient({
            provider: 'hp',
            username: 'username',
            password: 'password'
          });
      }).should.throw(new Error('authUrl is invalid'));
    });

    it('User should specify authUrl: storage client', function() {
      (function () {
          pkgcloud.storage.createClient({
            provider: 'hp',
            username: 'username',
            password: 'password'
          });
      }).should.throw(new Error('authUrl is invalid'));
    });


    it('User can specify custom region: storage client', function() {
      var customRegionClient = pkgcloud.storage.createClient({
            provider: 'hp',
            username: 'username',
            password: 'password',
            region: 'mycustomregion',
            authUrl: 'http://my-identity-service.com'
          });

      customRegionClient.config.should.have.property('region','mycustomregion');
    });

    it('User can specify custom region: compute client', function() {
      var customRegionClient = pkgcloud.compute.createClient({
            provider: 'hp',
            username: 'username',
            password: 'password',
            region: 'mycustomregion',
            authUrl: 'http://my-identity-service.com'
          });

      customRegionClient.config.should.have.property('region','mycustomregion');
    });
  });

  describe('Private cloud Uri resolution', function () {
    var eastUSRegion = 'region-b.geo-1', westUSRegion='region-a.geo-1';
    it('Client will not resolve URI if useInternal is true : East US',function(){
      (function () {
          pkgcloud.compute.createClient({
            provider: 'hp',
            username: 'username',
            password: 'password',
            useInternal: true,
            region: eastUSRegion
          });
      }).should.throw('authUrl is invalid');

    });

    it('Client will not resolve URI if useInternal is true : West US',function(){
      (function () {
          pkgcloud.compute.createClient({
            provider: 'hp',
            username: 'username',
            password: 'password',
            useInternal: true,
            region: westUSRegion
          });
      }).should.throw('authUrl is invalid');

    it('User can specify custom url for private cloud : West US',function(){
      var privateClient = pkgcloud.compute.createClient({
            provider: 'hp',
            username: 'username',
            password: 'password',
            useInternal: true,
            authUrl: 'http://my-internal-identity-service.com',
            region: westUSRegion
          });

      privateClient.config.should.have.property('authUrl','http://my-internal-identity-service.com');
     });

     it('User can specify custom url for private cloud : East US',function(){
       var privateClient = pkgcloud.compute.createClient({
             provider: 'hp',
             username: 'username',
             password: 'password',
             useInternal: true,
             authUrl: 'http://my-internal-identity-service.com',
             region: eastUSRegion
           });

       privateClient.config.should.have.property('authUrl','http://my-internal-identity-service.com');
      });

    });
  });
});
