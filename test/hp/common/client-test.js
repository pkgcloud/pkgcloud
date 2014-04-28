/*
* client-test.js: Tests for pkgcloud HP client functionality.
*
* (C) 2014 Phani Raj.
*
*/

var should = require('should'),
    async = require('async'),
    hock = require('hock'),
    pkgcloud = require('../../../lib/pkgcloud'),
    mock = !!process.env.MOCK;

describe('pkgcloud/hp/client', function () {
  describe('Region validation', function () {
    var eastUSRegion = 'region-b.geo-1', westUSRegion='region-a.geo-1';
    it('User should specify region: compute client', function() {
      (function () {
          pkgcloud.compute.createClient({
            "provider": "hp",
            "username": "username",
            "password": "password"
          });
      }).should.throw(new Error("region are not valid. Available regions are region-a.geo-1 (US-West), region-b.geo-1(US-East)');"));
    });

    it('User should specify region: storage client', function() {
      (function () {
          pkgcloud.storage.createClient({
            "provider": "hp",
            "username": "username",
            "password": "password"
          });
      }).should.throw(new Error("region are not valid. Available regions are region-a.geo-1 (US-West), region-b.geo-1(US-East)');"));
    });


    it('User can specify custom region: storage client', function() {
      var customRegionClient = pkgcloud.storage.createClient({
            "provider": "hp",
            "username": "username",
            "password": "password",
            "region": "mycustomregion",
            "authUrl": "http://my-identity-service.com"
          });

      customRegionClient.config.should.have.property('region','mycustomregion');
    });

    it('User can specify custom region: compute client', function() {
      var customRegionClient = pkgcloud.compute.createClient({
            "provider": "hp",
            "username": "username",
            "password": "password",
            "region": "mycustomregion",
            "authUrl": "http://my-identity-service.com"
          });

      customRegionClient.config.should.have.property('region','mycustomregion');
    });

    it('Client will auto-locate identity service for East US region : compute client', function() {
      var eastUSClient = pkgcloud.compute.createClient({
            "provider": "hp",
            "username": "username",
            "password": "password",
            "region": eastUSRegion
          });

      eastUSClient.config.should.have.property('authUrl','https://region-b.geo-1.identity.hpcloudsvc.com:35357/v2.0/');
    });

    it('Client will auto-locate identity service for East US region : storage client', function() {
      var eastUSClient = pkgcloud.storage.createClient({
            "provider": "hp",
            "username": "username",
            "password": "password",
            "region": eastUSRegion
          });

      eastUSClient.config.should.have.property('authUrl','https://region-b.geo-1.identity.hpcloudsvc.com:35357/v2.0/');
    });

    it('Client will auto-locate identity service for West US region : compute client', function() {
      var westUSClient = pkgcloud.compute.createClient({
            "provider": "hp",
            "username": "username",
            "password": "password",
            "region": westUSRegion
          });

      westUSClient.config.should.have.property('authUrl','https://region-a.geo-1.identity.hpcloudsvc.com:35357/v2.0/');
    });

    it('Client will auto-locate identity service for West US region : storage client', function() {
      var westUSClient = pkgcloud.storage.createClient({
            "provider": "hp",
            "username": "username",
            "password": "password",
            "region": westUSRegion
          });

      westUSClient.config.should.have.property('authUrl','https://region-a.geo-1.identity.hpcloudsvc.com:35357/v2.0/');
    });
  });
});
