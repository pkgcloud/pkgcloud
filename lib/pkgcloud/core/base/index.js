/*
 * index.js: Top-level include for pkgcloud `base` module from which all pkgcloud objects inherit.
 *
 * (C) 2011 Nodejitsu Inc.
 *
 */
 
var utile = require('utile');

utile.mixin(exports, require('./client'));
utile.mixin(exports, require('./model'));
