/*
 * images.js: Implementation of Joyent Images Client.
 *
 * (C) 2012, Nodejitsu Inc.
 *
 */
// ## Joyent Images Interface for pkgcloud
// 
// In joyent images are refered as DataSets. This is the pkgcloud wrapper 
// that exposes the joyent API for managing images
//
var pkgcloud = require('../../../../../lib/pkgcloud'),
    smartdc  = require('smartdc'),
    compute  = pkgcloud.providers.rackspace.compute;

// ### function getImages (details, callback) 
//
// Gets all Joyent images for the authenticated username / apikey.
//
// #### @id {Object|String} an object literal with options, or simple the 
// id of the flavor
// ####     @name    {String}  String name of the package
// ####     @noCache {Boolean} **Optional** Tells smartdc not to cache
// ####     @account {String}  **Optional** The login name of the acct
// #### @callback {function} f(err, flavor). `flavor` is an object that
// represents the flavor that was retrieved.
// #### @throws {TypeError} On bad input
//