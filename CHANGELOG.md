## v0.8.5
* Fixing a bug introduced by pre-release services listed in the Openstack Service Catalog

## v0.8.4
* Rackspace provider can now validate token with admin account
* Using through in lieu of pause-stream

## v0.8.3
* Dependency bump for request (2.22.0)
* Support internal Openstack service URLs

## v0.8.2
* Added support for File/Container metadata for Rackspace Storage
* Adding support for Rackspace CDN enabled Containers

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

