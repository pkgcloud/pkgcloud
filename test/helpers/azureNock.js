/**
 *  (C) Microsoft Open Technologies, Inc.   All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*
 azureNock - nock support for azure in test-server.js

 nock calls derived using nock.recorder.rec() against live Azure server.
 need to change azure subscription id to azure-account-subscription-id
 need to change azure storage account name to test-storage-account
 need to move deployment xml to create-ids-test.xml and create-test-reboot.xml
 */

var azureApi = require('../../lib/pkgcloud/azure/utils/azureApi'),
  _ = require('underscore'),
  requestId = 'b67cc525-ecc5-4661-8fd6-fb3e57d724f5',
  PATH = require('path'),
  helpers;

exports.serverTest = function(nock, testHelpers) {

  helpers = testHelpers;
  
  // Images
  nock('https://management.core.windows.net')
    .defaultReplyHeaders({'x-ms-request-id': requestId, 'Content-Type': 'application/xml'})
    .get('/azure-account-subscription-id/services/images')
    .reply(200, helpers.loadFixture('azure/images.xml'),{})
    .get('//azure-account-subscription-id/services/images/CANONICAL__Canonical-Ubuntu-12-04-amd64-server-20120528.1.3-en-us-30GB.vhd')
    .reply(200,helpers.loadFixture('azure/image-1.xml'),{})
    .get('//azure-account-subscription-id/services/images/CANONICAL__Canonical-Ubuntu-12-04-amd64-server-20120528.1.3-en-us-30GB.vhd')
    .reply(200,helpers.loadFixture('azure/image-1.xml'),{});

  // Servers
  nock('https://management.core.windows.net')
    .defaultReplyHeaders({'x-ms-request-id': requestId, 'Content-Type': 'application/xml'})
    // createServer() create-test-ids2
    .post('/azure-account-subscription-id/services/hostedservices/create-test-ids2/deployments', helpers.loadFixture('azure/create-test-ids2.xml'))
    .reply(202, "", {})
    // createServer() test-reboot
    .post('/azure-account-subscription-id/services/hostedservices/test-reboot/deployments', helpers.loadFixture('azure/create-test-reboot.xml'))
    .reply(202, "", {})
    // destroyServer()
    .delete('/azure-account-subscription-id/services/hostedservices/create-test-ids2/deployments/create-test-ids2')
    .reply(202, "", {})
    // shutDown server
    .post('/azure-account-subscription-id/services/hostedservices/create-test-ids2/deployments/create-test-ids2/roleInstances/create-test-ids2/Operations', helpers.loadFixture('azure/shutdown-role.xml'))
    .reply(201, "", {})
    // rebootServer()
    .post('/azure-account-subscription-id/services/hostedservices/test-reboot/deployments/test-reboot/roleInstances/test-reboot/Operations', '<RestartRoleOperation xmlns="http://schemas.microsoft.com/windowsazure" xmlns:i="http://www.w3.org/2001/XMLSchema-instance"><OperationType>RestartRoleOperation</OperationType></RestartRoleOperation>')
    .reply(202, "", {});

  // getServer() status
  nock('https://management.core.windows.net')
    .defaultReplyHeaders({'x-ms-request-id': requestId, 'Content-Type': 'application/xml'})
    .get('/azure-account-subscription-id/services/hostedservices/create-test-ids2?embed-detail=true')
    .reply(200, serverStatusReply('create-test-ids2','ReadyRole'))
    .get('/azure-account-subscription-id/services/hostedservices/create-test-ids2?embed-detail=true')
    .reply(200, serverStatusReply('create-test-ids2','ReadyRole'))
    .get('/azure-account-subscription-id/services/hostedservices/create-test-ids2?embed-detail=true')
    .reply(200, serverStatusReply('create-test-ids2','VMStopped'))
    .get('/azure-account-subscription-id/services/hostedservices/create-test-ids2?embed-detail=true')
    .reply(200, serverStatusReply('create-test-ids2','ReadyRole'))
    .get('/azure-account-subscription-id/services/hostedservices/create-test-ids2?embed-detail=true')
    .reply(200, serverStatusReply('create-test-ids2','VMStopped'))
    .get('/azure-account-subscription-id/services/hostedservices/create-test-ids2?embed-detail=true')
    .reply(200, serverStatusReply('create-test-ids2','ReadyRole'))
    .get('/azure-account-subscription-id/services/hostedservices/create-test-ids2?embed-detail=true')
    .reply(200, serverStatusReply('create-test-ids2','ReadyRole'))
    .get('/azure-account-subscription-id/services/hostedservices/test-reboot?embed-detail=true')
    .reply(200, serverStatusReply('test-reboot','VMStopped'))
    .get('/azure-account-subscription-id/services/hostedservices/test-reboot?embed-detail=true')
    .reply(200, serverStatusReply('test-reboot','ReadyRole'))
    .get('/azure-account-subscription-id/services/hostedservices/test-reboot?embed-detail=true')
    .reply(200, serverStatusReply('test-reboot','ReadyRole'))
    .get('/azure-account-subscription-id/services/hostedservices/test-reboot?embed-detail=true')
    .reply(200, serverStatusReply('test-reboot','ReadyRole'));

  // HostedServices
  nock('https://management.core.windows.net')
    .defaultReplyHeaders({'x-ms-request-id': requestId, 'Content-Type': 'application/xml'})
    .get('/azure-account-subscription-id/services/hostedservices')
    .reply(200, "<HostedServices xmlns=\"http://schemas.microsoft.com/windowsazure\" xmlns:i=\"http://www.w3.org/2001/XMLSchema-instance\"><HostedService><Url>https://management.core.windows.net/azure-account-subscription-id/services/hostedservices/create-test-ids2</Url><ServiceName>create-test-ids2</ServiceName><HostedServiceProperties><Description>service created by pkgcloud</Description><Location>East US</Location><Label>Y3JlYXRlLXRlc3QtaWRzMg==</Label><Status>Created</Status><DateCreated>2012-11-11T18:13:55Z</DateCreated><DateLastModified>2012-11-11T18:14:37Z</DateLastModified><ExtendedProperties/></HostedServiceProperties></HostedService></HostedServices>", {})
    .get('/azure-account-subscription-id/services/hostedservices')
    .reply(200, "<HostedServices xmlns=\"http://schemas.microsoft.com/windowsazure\" xmlns:i=\"http://www.w3.org/2001/XMLSchema-instance\"><HostedService><Url>https://management.core.windows.net/azure-account-subscription-id/services/hostedservices/create-test-ids2</Url><ServiceName>create-test-ids2</ServiceName><HostedServiceProperties><Description>service created by pkgcloud</Description><Location>East US</Location><Label>Y3JlYXRlLXRlc3QtaWRzMg==</Label><Status>Created</Status><DateCreated>2012-11-11T18:13:55Z</DateCreated><DateLastModified>2012-11-11T18:14:37Z</DateLastModified><ExtendedProperties/></HostedServiceProperties></HostedService></HostedServices>", {})
    .get('/azure-account-subscription-id/services/hostedservices/test-reboot?embed-detail=true')
    .reply(404,helpers.loadFixture('azure/hosted-service-404.xml'),{})
    .post('/azure-account-subscription-id/services/hostedservices', helpers.loadFixture('azure/create-test-reboot-hosted-service.xml'))
    .reply(201, "", {})
    //delete hosted service
    .delete('/azure-account-subscription-id/services/hostedservices/create-test-ids2')
    .reply(200, "", {})
    .get('/azure-account-subscription-id/services/hostedservices/create-test-ids2?embed-detail=true')
    .reply(404,helpers.loadFixture('azure/hosted-service-404.xml'),{})
    .post('/azure-account-subscription-id/services/hostedservices', helpers.loadFixture('azure/create-test-ids2-hosted-service.xml'))
    .reply(201, "", {});

  // VM OSImage disk
  nock('https://management.core.windows.net')
    .defaultReplyHeaders({'x-ms-request-id': requestId, 'Content-Type': 'application/xml'})
    .delete('/azure-account-subscription-id/services/disks/create-test-ids2-create-test-ids2-0-20121111181413')
    .reply(200, "", {})

  // VM image blob
  nock('http://test-storage-account.' + azureApi.STORAGE_ENDPOINT)
    .delete('/vhd/create-test-ids2.vhd')
    .reply(202, "", helpers.azureDeleteResponseHeaders());

  // Certificates
  nock('https://management.core.windows.net')
    .defaultReplyHeaders({'x-ms-request-id': requestId, 'Content-Type': 'application/xml'})
    // need to filter request body because base64 of cert is different on mac/windows
    .filteringRequestBody(/.*/, '*')
    .post('/azure-account-subscription-id/services/hostedservices/test-reboot/certificates', '*')
    .reply(202, "", {})
    .post('/azure-account-subscription-id/services/hostedservices/create-test-ids2/certificates', '*')
    .reply(202, "", {});

  // Get Operations status requests
  // we need a lot of these
  // Note: all requestIds should be b67cc525-ecc5-4661-8fd6-fb3e57d724f5.
  // Actual azure cloud returns a unique requestId for each request but
  // that would be a nightmare to Nock
  nock('https://management.core.windows.net')
    .get('/azure-account-subscription-id/operations/b67cc525-ecc5-4661-8fd6-fb3e57d724f5')
    .reply(200,helpers.loadFixture('azure/operation-succeeded.xml'),{})
    .get('/azure-account-subscription-id/operations/b67cc525-ecc5-4661-8fd6-fb3e57d724f5')
    .reply(200,helpers.loadFixture('azure/operation-succeeded.xml'),{})
    .get('/azure-account-subscription-id/operations/b67cc525-ecc5-4661-8fd6-fb3e57d724f5')
    .reply(200,helpers.loadFixture('azure/operation-inprogress.xml'),{})
    .get('/azure-account-subscription-id/operations/b67cc525-ecc5-4661-8fd6-fb3e57d724f5')
    .reply(200,helpers.loadFixture('azure/operation-succeeded.xml'),{})
    .get('/azure-account-subscription-id/operations/b67cc525-ecc5-4661-8fd6-fb3e57d724f5')
    .reply(200,helpers.loadFixture('azure/operation-succeeded.xml'),{})
    .get('/azure-account-subscription-id/operations/b67cc525-ecc5-4661-8fd6-fb3e57d724f5')
    .reply(200,helpers.loadFixture('azure/operation-inprogress.xml'),{})
    .get('/azure-account-subscription-id/operations/b67cc525-ecc5-4661-8fd6-fb3e57d724f5')
    .reply(200,helpers.loadFixture('azure/operation-succeeded.xml'),{})
    .get('/azure-account-subscription-id/operations/b67cc525-ecc5-4661-8fd6-fb3e57d724f5')
    .reply(200,helpers.loadFixture('azure/operation-succeeded.xml'),{})
    .get('/azure-account-subscription-id/operations/b67cc525-ecc5-4661-8fd6-fb3e57d724f5')
    .reply(200,helpers.loadFixture('azure/operation-inprogress.xml'),{})
    .get('/azure-account-subscription-id/operations/b67cc525-ecc5-4661-8fd6-fb3e57d724f5')
    .reply(200,helpers.loadFixture('azure/operation-succeeded.xml'),{})
    .get('/azure-account-subscription-id/operations/b67cc525-ecc5-4661-8fd6-fb3e57d724f5')
    .reply(200,helpers.loadFixture('azure/operation-succeeded.xml'),{})
    .get('/azure-account-subscription-id/operations/b67cc525-ecc5-4661-8fd6-fb3e57d724f5')
    .reply(200,helpers.loadFixture('azure/operation-succeeded.xml'),{})
    .get('/azure-account-subscription-id/operations/b67cc525-ecc5-4661-8fd6-fb3e57d724f5')
    .reply(200,helpers.loadFixture('azure/operation-succeeded.xml'),{})
    .get('/azure-account-subscription-id/operations/b67cc525-ecc5-4661-8fd6-fb3e57d724f5')
    .reply(200,helpers.loadFixture('azure/operation-succeeded.xml'),{})
    .get('/azure-account-subscription-id/operations/b67cc525-ecc5-4661-8fd6-fb3e57d724f5')
    .reply(200,helpers.loadFixture('azure/operation-inprogress.xml'),{})
    .get('/azure-account-subscription-id/operations/b67cc525-ecc5-4661-8fd6-fb3e57d724f5')
    .reply(200,helpers.loadFixture('azure/operation-succeeded.xml'),{})
    .get('/azure-account-subscription-id/operations/b67cc525-ecc5-4661-8fd6-fb3e57d724f5')
    .reply(200,helpers.loadFixture('azure/operation-succeeded.xml'),{})
    .get('/azure-account-subscription-id/operations/b67cc525-ecc5-4661-8fd6-fb3e57d724f5')
    .reply(200,helpers.loadFixture('azure/operation-succeeded.xml'),{})
    .get('/azure-account-subscription-id/operations/b67cc525-ecc5-4661-8fd6-fb3e57d724f5')
    .reply(200,helpers.loadFixture('azure/operation-succeeded.xml'),{})
    .get('/azure-account-subscription-id/operations/b67cc525-ecc5-4661-8fd6-fb3e57d724f5')
    .reply(200,helpers.loadFixture('azure/operation-succeeded.xml'),{});
};

/**
 * serverStatusReply()
 * fills in the nock xml reply from the server with server name and status
 * @param name - name of the server
 * @param status - status to be returned in reply
 *  status should be:
 *      ReadyRole - server is RUNNING
 *      VMStopped - server is still PROVISIONING
 *      Provisioning - server is still PROVISIONING
 *      see lib/pkgcloud/azure/compute/server.js for more status values
 *
 * @param helpers - test helper object
 * @return {String} - the xml reply containing the server name and status
 */
var serverStatusReply = function(name, status) {

  var template = helpers.loadFixture('azure/server-status-template.xml'),
    params = {NAME: name, STATUS: status};

  var result = _.template(template, params);
  return result;
};

var filterPath = function(path) {
  var name = PATH.basename(path);
  if(path.search('embed-detail=true') !== -1) {
    return '/getStatus?name=' + name;
  }

  return path;
};


