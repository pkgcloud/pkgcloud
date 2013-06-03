## v0.8.1
* Added support for limit/marker options for Rackspace getContainers, getFiles
* removed unused Rackspace.File.rm/ls/cp methods
* Fixed a bug in File.fullPath
* Fixed a bug in Azure header signing

## v0.8.0
* Rewrote Rackspace Client to derive from Openstack Client
* Updated Rackspace & Openstack createClient calls to take a proper URI for authUrl
* Added support to specify region in Rackspace & Openstack createClient options
* Added the ability to automatically re-authenticate on token expiry

## v0.7.3
* Fixed inline authentication for streaming to rackspace/openstack storage #109
* Fixed S3 multi-part upload signing #137
* Optimized S3 upload #124
* Fixed Rackspace authentication to return error on unauthorized #140

## v0.7.2
* Added a pkgcloud User-Agent for outbound HTTP requests #134
* Added tests for core compute method signatures

