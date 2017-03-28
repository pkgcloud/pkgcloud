## v1.3.0
* OpenStack identity v3 (keystone) support, Issue [#367](//github.com/pkgcloud/pkgcloud/issues/367), [#477](//github.com/pkgcloud/pkgcloud/issues/477), PR [#461](//github.com/pkgcloud/pkgcloud/pull/461)
* OpenStack cancel client download, Issue [#379](//github.com/pkgcloud/pkgcloud/issues/379), PR [#416](//github.com/pkgcloud/pkgcloud/pull/416)
* OpenStack improved directory support for getFiles, PR [#390](//github.com/pkgcloud/pkgcloud/pull/390)
* Add support for prepending a custom user agent, Issue [#394](//github.com/pkgcloud/pkgcloud/issues/394), PR [#395](//github.com/pkgcloud/pkgcloud/pull/395)
* OpenStack fixed storage copy function, Issue [#396](//github.com/pkgcloud/pkgcloud/issues/396) , PR [#350](//github.com/pkgcloud/pkgcloud/pull/350)
* OpenStack allow non-strict SSL, PR [#397](//github.com/pkgcloud/pkgcloud/pull/397)
* Adding a refresh method on the stack model, Issue [#398](//github.com/pkgcloud/pkgcloud/issues/398), PR [#402](//github.com/pkgcloud/pkgcloud/pull/402)
* Google storage return metadata in success handler, Issue [#400](//github.com/pkgcloud/pkgcloud/issues/400), PR [#401](//github.com/pkgcloud/pkgcloud/pull/401)
* OpenStack added template outputs field to stack, PR [#403](//github.com/pkgcloud/pkgcloud/pull/403)
* Amazon fixes to AWS config, Issue [#406](//github.com/pkgcloud/pkgcloud/issues/406), PR [#407](//github.com/pkgcloud/pkgcloud/pull/xxx), [#409](//github.com/pkgcloud/pkgcloud/pull/407)
* Added support for nestedDepth option to stack getResources method, Issue [#410](//github.com/pkgcloud/pkgcloud/issues/410), PR [#411](//github.com/pkgcloud/pkgcloud/pull/411)
* Added support for networking security groups, security group rules, PR [#412](//github.com/pkgcloud/pkgcloud/pull/412)
* Allow passing options to rebuildServer, Issue [#414](//github.com/pkgcloud/pkgcloud/issues/414), PR [#415](//github.com/pkgcloud/pkgcloud/pull/415)
* Allow deleteStack to accept stack object or stack name, Issue [#418](//github.com/pkgcloud/pkgcloud/issues/418), PR [#420](//github.com/pkgcloud/pkgcloud/pull/420)
* Amazon createServer: use pluralized keys for SecurityGroups/SecurityGroupIds, Issue [#432](//github.com/pkgcloud/pkgcloud/issues/432), PR [#433](//github.com/pkgcloud/pkgcloud/pull/433)
* RackSpace, OpenStack add enableRootUser and listRootStatus, PR [#438](//github.com/pkgcloud/pkgcloud/pull/438)
* Amazon storage added cache control support to s3 buckets, PR [#447](//github.com/pkgcloud/pkgcloud/pull/447)
* OpenStack compute added deleteRule, PR [#456](//github.com/pkgcloud/pkgcloud/pull/456)
* DigitalOcean ported provider to APIv2, PR [#470](//github.com/pkgcloud/pkgcloud/pull/470)
* OpenStack handle request errors in client.upload flow, Issue [#481](//github.com/pkgcloud/pkgcloud/issues/481), PR [#484](//github.com/pkgcloud/pkgcloud/pull/484)
* OpenStack added adminPass attribute to createServer, PR [#486](//github.com/pkgcloud/pkgcloud/pull/486)
* Amazon added AWS specific options for cache control and file encryption, PR [#496](//github.com/pkgcloud/pkgcloud/pull/496)
* Misc doc fixes, PR [#417](//github.com/pkgcloud/pkgcloud/pull/417), [#426](//github.com/pkgcloud/pkgcloud/pull/426), [#429](//github.com/pkgcloud/pkgcloud/pull/429), [#442](//github.com/pkgcloud/pkgcloud/pull/442), [#444](//github.com/pkgcloud/pkgcloud/pull/444), [#449](//github.com/pkgcloud/pkgcloud/pull/449), [#498](//github.com/pkgcloud/pkgcloud/pull/498)

## v1.2.0
* Added Support for Openstack CDN (Poppy)

## v1.1.0
* Added support for Google Cloud Storage
* Added support for Rackspace Cloud Networks

## v1.0.3
* Adding support for Openstack Trove, and adding HP, rackspace providers

## v1.0.2
* Adding support for OpenStack Cinder

## v1.0.1
* Adding a rackspace orchestration provider

## v1.0.0
* Requires node 0.10, dropping support for node v0.8
* Fundamentally changed the streaming file api for upload. No longer takes a callback. See #332
* Significant cleanup across storage apis across providers
* Added `toJSON` on all models
* Changed underlying Amazon provider to use aws-sdk
* Added Openstack Heat provider
* updated all package dependencies, including removing `utile`
* static website support for Rackspace Cloud Files
* Added compute.keys support for HP Compute provider

## v0.9.6
* Fixed a long-standing bug in openstack.compute.getFlavor #292

## v0.9.5
* Openstack Network service.
* Added support for HP Cloud provider.
* Added support for Rackspace Storage Temporary URLs

## v0.9.4
* Added support for os-security-groups compute extension

## v0.9.2
* fixed a bug where CDN containers were broken with Rackspace CloudFiles #257

## v0.9.1
* Removing an unnecessary continuity check in openstack identity client
* Switching Debug events to trace events
* Be more explicit with content types for openstack authentication
* Allow passing tenant to the context authenticator
* Fixing the networks property to be on server options for openstack compute

## v0.9.0
* OpenStack Documentation
* Openstack Storage Provider
* fixed a bug with piping downloads from storage services #195
* internal refactor for leaky abstractions
* OpenStack identity client as a proper client

## v0.8.17
* Make default for destroyServer (DigitalOcean) to scrub data #215

## v0.8.16
* Add *beta* support for Rackspace Cloud Load Balancers

## v0.8.15
* Various fixes in openstack/rackspace compute provider
* Added doc updates for rackspace storage provider
* fixed a bug in rackspace dns provider

## v0.8.14
* Added support to specify network in openstack.createServer
* More robust error handling for API inconsistencies in Rackspace/Openstack

## v0.8.13
* Added support for Rackspace Cloud BlockStorage

## v0.8.12
* Changed the callback signature for openstack.identity.getTenantInfo to include body

## v0.8.11
* Added more robust error handling for openstack.identity admin methods

## v0.8.10
* Fixing a bug in rackspace.dns where status call can be an empty response

## v0.8.9
* Fixing a bug when rackspace.dns.createRecord returns an array

## v0.8.8
* Adding support for uploading a tar.gz to Cloud files and extract on upload
* Minor tenant changes for openstack identity providers

## v0.8.7
* Adding Rackspace CloudDNS as a DNS service

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
