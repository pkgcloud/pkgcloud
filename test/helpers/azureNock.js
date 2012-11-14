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

 nock calls created by nock.recorder.rec() against live Azure server.
 need to change azure subscription id to azure-account-subscription-id
 need to change azure storage account name to test-storage-account
 need to move deployment xml to create-ids-test.xml and create-test-reboot.xml
 */

exports.serverTest = function(nock, helpers) {
  nock('https://management.core.windows.net')
    .get('/azure-account-subscription-id/services/images')
    .reply(200, helpers.loadFixture('azure/images.xml'),{})
    .get('/azure-account-subscription-id/services/hostedservices/create-test-ids2?embed-detail=true')
    .reply(404,helpers.loadFixture('azure/hosted-service-404.xml'),{})
    .post('/azure-account-subscription-id/services/hostedservices', helpers.loadFixture('azure/create-test-ids2-hosted-service.xml'))
    .reply(201, "", { 'cache-control': 'no-cache',
      'content-length': '0',
      location: 'https://management.core.windows.net/subscriptions/azure-account-subscription-id/compute/create-test-ids2',
      server: '6.0.6002.18488 (rd_rdfe_stable.121021-2100) Microsoft-HTTPAPI/2.0',
      'x-ms-request-id': '6b7a340efb114690b5e583ef2f70dc76',
      date: 'Sun, 11 Nov 2012 18:13:55 GMT' });

  nock('https://management.core.windows.net')
    .get('/azure-account-subscription-id/operations/6b7a340efb114690b5e583ef2f70dc76')
    .reply(200, "<Operation xmlns=\"http://schemas.microsoft.com/windowsazure\" xmlns:i=\"http://www.w3.org/2001/XMLSchema-instance\"><ID>6b7a340e-fb11-4690-b5e5-83ef2f70dc76</ID><Status>Succeeded</Status><HttpStatusCode>200</HttpStatusCode></Operation>", { 'cache-control': 'no-cache',
      'content-length': '232',
      'content-type': 'application/xml; charset=utf-8',
      server: '6.0.6002.18488 (rd_rdfe_stable.121021-2100) Microsoft-HTTPAPI/2.0',
      'x-ms-request-id': '90e595be76d44604a2c3ecc33c3697f6',
      date: 'Sun, 11 Nov 2012 18:13:56 GMT' });

  nock('https://management.core.windows.net')
    .get('//azure-account-subscription-id/services/images/CANONICAL__Canonical-Ubuntu-12-04-amd64-server-20120528.1.3-en-us-30GB.vhd')
    .reply(200,helpers.loadFixture('azure/image-1.xml'),{});

  nock('https://management.core.windows.net')
    .post('/azure-account-subscription-id/services/hostedservices/create-test-ids2/certificates',  helpers.loadFixture('azure/add-certificate.xml'))
    .reply(202, "", { 'cache-control': 'no-cache',
      'content-length': '0',
      server: '6.0.6002.18488 (rd_rdfe_stable.121021-2100) Microsoft-HTTPAPI/2.0',
      'x-ms-request-id': '6eab8d02fd414207b2733cd8bd808d8b',
      date: 'Sun, 11 Nov 2012 18:13:57 GMT' });

  nock('https://management.core.windows.net')
    .get('/azure-account-subscription-id/operations/6eab8d02fd414207b2733cd8bd808d8b')
    .reply(200, "<Operation xmlns=\"http://schemas.microsoft.com/windowsazure\" xmlns:i=\"http://www.w3.org/2001/XMLSchema-instance\"><ID>6eab8d02-fd41-4207-b273-3cd8bd808d8b</ID><Status>InProgress</Status></Operation>", { 'cache-control': 'no-cache',
      'content-length': '197',
      'content-type': 'application/xml; charset=utf-8',
      server: '6.0.6002.18488 (rd_rdfe_stable.121021-2100) Microsoft-HTTPAPI/2.0',
      'x-ms-request-id': '7e827d04040d41deaffb5b6c046bdba4',
      date: 'Sun, 11 Nov 2012 18:13:58 GMT' });

  nock('https://management.core.windows.net')
    .get('/azure-account-subscription-id/operations/6eab8d02fd414207b2733cd8bd808d8b')
    .reply(200, "<Operation xmlns=\"http://schemas.microsoft.com/windowsazure\" xmlns:i=\"http://www.w3.org/2001/XMLSchema-instance\"><ID>6eab8d02-fd41-4207-b273-3cd8bd808d8b</ID><Status>Succeeded</Status><HttpStatusCode>200</HttpStatusCode></Operation>", { 'cache-control': 'no-cache',
      'content-length': '232',
      'content-type': 'application/xml; charset=utf-8',
      server: '6.0.6002.18488 (rd_rdfe_stable.121021-2100) Microsoft-HTTPAPI/2.0',
      'x-ms-request-id': '20ddd2fb008947d79d60bc53d13481b8',
      date: 'Sun, 11 Nov 2012 18:14:10 GMT' });

  nock('https://management.core.windows.net')
    .post('/azure-account-subscription-id/services/hostedservices/create-test-ids2/deployments', helpers.loadFixture('azure/create-test-ids2.xml'))
    .reply(202, "", { 'cache-control': 'no-cache',
      'content-length': '0',
      server: '6.0.6002.18488 (rd_rdfe_stable.121021-2100) Microsoft-HTTPAPI/2.0',
      'x-ms-request-id': '636c060108354e1785abdd52f0a0d660',
      date: 'Sun, 11 Nov 2012 18:14:12 GMT' });

  nock('https://management.core.windows.net')
    .get('/azure-account-subscription-id/operations/636c060108354e1785abdd52f0a0d660')
    .reply(200, "<Operation xmlns=\"http://schemas.microsoft.com/windowsazure\" xmlns:i=\"http://www.w3.org/2001/XMLSchema-instance\"><ID>636c0601-0835-4e17-85ab-dd52f0a0d660</ID><Status>InProgress</Status></Operation>", { 'cache-control': 'no-cache',
      'content-length': '197',
      'content-type': 'application/xml; charset=utf-8',
      server: '6.0.6002.18488 (rd_rdfe_stable.121021-2100) Microsoft-HTTPAPI/2.0',
      'x-ms-request-id': '0f74feeb738d4ba1a58c399ea2a6048a',
      date: 'Sun, 11 Nov 2012 18:14:15 GMT' });

  nock('https://management.core.windows.net')
    .get('/azure-account-subscription-id/operations/636c060108354e1785abdd52f0a0d660')
    .reply(200, "<Operation xmlns=\"http://schemas.microsoft.com/windowsazure\" xmlns:i=\"http://www.w3.org/2001/XMLSchema-instance\"><ID>636c0601-0835-4e17-85ab-dd52f0a0d660</ID><Status>Succeeded</Status><HttpStatusCode>200</HttpStatusCode></Operation>", { 'cache-control': 'no-cache',
      'content-length': '232',
      'content-type': 'application/xml; charset=utf-8',
      server: '6.0.6002.18488 (rd_rdfe_stable.121021-2100) Microsoft-HTTPAPI/2.0',
      'x-ms-request-id': 'bff6dc57a38b443aadc4d29366ee91aa',
      date: 'Sun, 11 Nov 2012 18:15:08 GMT' });

  nock('https://management.core.windows.net')
    .get('/azure-account-subscription-id/services/hostedservices/create-test-ids2?embed-detail=true')
    .reply(200, "<HostedService xmlns=\"http://schemas.microsoft.com/windowsazure\" xmlns:i=\"http://www.w3.org/2001/XMLSchema-instance\"><Url>https://management.core.windows.net/azure-account-subscription-id/services/hostedservices/create-test-ids2</Url><ServiceName>create-test-ids2</ServiceName><HostedServiceProperties><Description>service created by pkgcloud</Description><Location>East US</Location><Label>Y3JlYXRlLXRlc3QtaWRzMg==</Label><Status>Created</Status><DateCreated>2012-11-11T18:13:55Z</DateCreated><DateLastModified>2012-11-11T18:14:37Z</DateLastModified><ExtendedProperties/></HostedServiceProperties><Deployments><Deployment><Name>create-test-ids2</Name><DeploymentSlot>Production</DeploymentSlot><PrivateID>f08040e5e922456a859f77254a703495</PrivateID><Status>Running</Status><Label>WTNKbFlYUmxMWFJsYzNRdGFXUnpNZz09</Label><Url>http://create-test-ids2.cloudapp.net/</Url><Configuration>PFNlcnZpY2VDb25maWd1cmF0aW9uIHhtbG5zOnhzZD0iaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEiIHhtbG5zOnhzaT0iaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEtaW5zdGFuY2UiIHhtbG5zPSJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL1NlcnZpY2VIb3N0aW5nLzIwMDgvMTAvU2VydmljZUNvbmZpZ3VyYXRpb24iPg0KICA8Um9sZSBuYW1lPSJjcmVhdGUtdGVzdC1pZHMyIj4NCiAgICA8SW5zdGFuY2VzIGNvdW50PSIxIiAvPg0KICA8L1JvbGU+DQo8L1NlcnZpY2VDb25maWd1cmF0aW9uPg==</Configuration><RoleInstanceList><RoleInstance><RoleName>create-test-ids2</RoleName><InstanceName>create-test-ids2</InstanceName><InstanceStatus>StoppedVM</InstanceStatus><InstanceUpgradeDomain>0</InstanceUpgradeDomain><InstanceFaultDomain>0</InstanceFaultDomain><InstanceSize>ExtraSmall</InstanceSize><InstanceStateDetails/><IpAddress>10.74.100.131</IpAddress><InstanceEndpoints><InstanceEndpoint><Name>ssh</Name><Vip>168.62.176.239</Vip><PublicPort>22</PublicPort><LocalPort>22</LocalPort><Protocol>tcp</Protocol></InstanceEndpoint></InstanceEndpoints><PowerState>Stopped</PowerState></RoleInstance></RoleInstanceList><UpgradeDomainCount>1</UpgradeDomainCount><RoleList>" +
    "<Role i:type=\"PersistentVMRole\"><RoleName>create-test-ids2</RoleName><OsVersion/><RoleType>PersistentVMRole</RoleType><ConfigurationSets><ConfigurationSet i:type=\"NetworkConfigurationSet\"><ConfigurationSetType>NetworkConfiguration</ConfigurationSetType><InputEndpoints><InputEndpoint><LocalPort>22</LocalPort><Name>ssh</Name><Port>22</Port><Protocol>tcp</Protocol><Vip>168.62.176.239</Vip></InputEndpoint></InputEndpoints><SubnetNames/></ConfigurationSet></ConfigurationSets><DataVirtualHardDisks/><OSVirtualHardDisk><HostCaching>ReadWrite</HostCaching><DiskName>create-test-ids2-create-test-ids2-0-20121111181413</DiskName><MediaLink>http://test-storage-account.blob.core.windows.net/vhd/create-test-ids2.vhd</MediaLink><SourceImageName>CANONICAL__Canonical-Ubuntu-12-04-amd64-server-20120528.1.3-en-us-30GB.vhd</SourceImageName><OS>Linux</OS></OSVirtualHardDisk><RoleSize>ExtraSmall</RoleSize></Role></RoleList><SdkVersion/><Locked>false</Locked><RollbackAllowed>false</RollbackAllowed><CreatedTime>2012-11-11T18:14:12Z</CreatedTime><LastModifiedTime>2012-11-11T18:14:37Z</LastModifiedTime><ExtendedProperties/><PersistentVMDowntime><StartTime>2012-10-21T18:20:20Z</StartTime><EndTime>2013-10-21T18:20:20Z</EndTime><Status>PersistentVMUpdateCompleted</Status></PersistentVMDowntime></Deployment></Deployments></HostedService>", { 'cache-control': 'no-cache',
      'content-length': '3287',
      'content-type': 'application/xml; charset=utf-8',
      server: '6.0.6002.18488 (rd_rdfe_stable.121021-2100) Microsoft-HTTPAPI/2.0',
      'x-ms-request-id': 'afe954a4d4e348af81d118874770094f',
      date: 'Sun, 11 Nov 2012 18:15:12 GMT' });

  nock('https://management.core.windows.net')
    .get('/azure-account-subscription-id/services/hostedservices/create-test-ids2?embed-detail=true')
    .reply(200, "<HostedService xmlns=\"http://schemas.microsoft.com/windowsazure\" xmlns:i=\"http://www.w3.org/2001/XMLSchema-instance\"><Url>https://management.core.windows.net/azure-account-subscription-id/services/hostedservices/create-test-ids2</Url><ServiceName>create-test-ids2</ServiceName><HostedServiceProperties><Description>service created by pkgcloud</Description><Location>East US</Location><Label>Y3JlYXRlLXRlc3QtaWRzMg==</Label><Status>Created</Status><DateCreated>2012-11-11T18:13:55Z</DateCreated><DateLastModified>2012-11-11T18:14:37Z</DateLastModified><ExtendedProperties/></HostedServiceProperties><Deployments><Deployment><Name>create-test-ids2</Name><DeploymentSlot>Production</DeploymentSlot><PrivateID>f08040e5e922456a859f77254a703495</PrivateID><Status>Running</Status><Label>WTNKbFlYUmxMWFJsYzNRdGFXUnpNZz09</Label><Url>http://create-test-ids2.cloudapp.net/</Url><Configuration>PFNlcnZpY2VDb25maWd1cmF0aW9uIHhtbG5zOnhzZD0iaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEiIHhtbG5zOnhzaT0iaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEtaW5zdGFuY2UiIHhtbG5zPSJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL1NlcnZpY2VIb3N0aW5nLzIwMDgvMTAvU2VydmljZUNvbmZpZ3VyYXRpb24iPg0KICA8Um9sZSBuYW1lPSJjcmVhdGUtdGVzdC1pZHMyIj4NCiAgICA8SW5zdGFuY2VzIGNvdW50PSIxIiAvPg0KICA8L1JvbGU+DQo8L1NlcnZpY2VDb25maWd1cmF0aW9uPg==</Configuration><RoleInstanceList><RoleInstance><RoleName>create-test-ids2</RoleName><InstanceName>create-test-ids2</InstanceName><InstanceStatus>StoppedVM</InstanceStatus><InstanceUpgradeDomain>0</InstanceUpgradeDomain><InstanceFaultDomain>0</InstanceFaultDomain><InstanceSize>ExtraSmall</InstanceSize><InstanceStateDetails/><IpAddress>10.74.100.131</IpAddress><InstanceEndpoints><InstanceEndpoint><Name>ssh</Name><Vip>168.62.176.239</Vip><PublicPort>22</PublicPort><LocalPort>22</LocalPort><Protocol>tcp</Protocol></InstanceEndpoint></InstanceEndpoints><PowerState>Stopped</PowerState></RoleInstance></RoleInstanceList><UpgradeDomainCount>1</UpgradeDomainCount><RoleList>" +
    "<Role i:type=\"PersistentVMRole\"><RoleName>create-test-ids2</RoleName><OsVersion/><RoleType>PersistentVMRole</RoleType><ConfigurationSets><ConfigurationSet i:type=\"NetworkConfigurationSet\"><ConfigurationSetType>NetworkConfiguration</ConfigurationSetType><InputEndpoints><InputEndpoint><LocalPort>22</LocalPort><Name>ssh</Name><Port>22</Port><Protocol>tcp</Protocol><Vip>168.62.176.239</Vip></InputEndpoint></InputEndpoints><SubnetNames/></ConfigurationSet></ConfigurationSets><DataVirtualHardDisks/><OSVirtualHardDisk><HostCaching>ReadWrite</HostCaching><DiskName>create-test-ids2-create-test-ids2-0-20121111181413</DiskName><MediaLink>http://test-storage-account.blob.core.windows.net/vhd/create-test-ids2.vhd</MediaLink><SourceImageName>CANONICAL__Canonical-Ubuntu-12-04-amd64-server-20120528.1.3-en-us-30GB.vhd</SourceImageName><OS>Linux</OS></OSVirtualHardDisk><RoleSize>ExtraSmall</RoleSize></Role></RoleList><SdkVersion/><Locked>false</Locked><RollbackAllowed>false</RollbackAllowed><CreatedTime>2012-11-11T18:14:12Z</CreatedTime><LastModifiedTime>2012-11-11T18:14:37Z</LastModifiedTime><ExtendedProperties/><PersistentVMDowntime><StartTime>2012-10-21T18:20:20Z</StartTime><EndTime>2013-10-21T18:20:20Z</EndTime><Status>PersistentVMUpdateCompleted</Status></PersistentVMDowntime></Deployment></Deployments></HostedService>", { 'cache-control': 'no-cache',
      'content-length': '3287',
      'content-type': 'application/xml; charset=utf-8',
      server: '6.0.6002.18488 (rd_rdfe_stable.121021-2100) Microsoft-HTTPAPI/2.0',
      'x-ms-request-id': '74313ad871a945c3ab728a84bc97e0ef',
      date: 'Sun, 11 Nov 2012 18:15:12 GMT' });

  nock('https://management.core.windows.net')
    .get('/azure-account-subscription-id/services/hostedservices')
    .reply(200, "<HostedServices xmlns=\"http://schemas.microsoft.com/windowsazure\" xmlns:i=\"http://www.w3.org/2001/XMLSchema-instance\"><HostedService><Url>https://management.core.windows.net/azure-account-subscription-id/services/hostedservices/create-test-ids2</Url><ServiceName>create-test-ids2</ServiceName><HostedServiceProperties><Description>service created by pkgcloud</Description><Location>East US</Location><Label>Y3JlYXRlLXRlc3QtaWRzMg==</Label><Status>Created</Status><DateCreated>2012-11-11T18:13:55Z</DateCreated><DateLastModified>2012-11-11T18:14:37Z</DateLastModified><ExtendedProperties/></HostedServiceProperties></HostedService></HostedServices>", { 'cache-control': 'no-cache',
      'content-length': '654',
      'content-type': 'application/xml; charset=utf-8',
      server: '6.0.6002.18488 (rd_rdfe_stable.121021-2100) Microsoft-HTTPAPI/2.0',
      'x-ms-request-id': 'f6f554ea55524494ab78cda6069dcbb5',
      date: 'Sun, 11 Nov 2012 18:15:12 GMT' });

  nock('https://management.core.windows.net')
    .get('/azure-account-subscription-id/services/hostedservices/create-test-ids2?embed-detail=true')
    .reply(200, "<HostedService xmlns=\"http://schemas.microsoft.com/windowsazure\" xmlns:i=\"http://www.w3.org/2001/XMLSchema-instance\"><Url>https://management.core.windows.net/azure-account-subscription-id/services/hostedservices/create-test-ids2</Url><ServiceName>create-test-ids2</ServiceName><HostedServiceProperties><Description>service created by pkgcloud</Description><Location>East US</Location><Label>Y3JlYXRlLXRlc3QtaWRzMg==</Label><Status>Created</Status><DateCreated>2012-11-11T18:13:55Z</DateCreated><DateLastModified>2012-11-11T18:14:37Z</DateLastModified><ExtendedProperties/></HostedServiceProperties><Deployments><Deployment><Name>create-test-ids2</Name><DeploymentSlot>Production</DeploymentSlot><PrivateID>f08040e5e922456a859f77254a703495</PrivateID><Status>Running</Status><Label>WTNKbFlYUmxMWFJsYzNRdGFXUnpNZz09</Label><Url>http://create-test-ids2.cloudapp.net/</Url><Configuration>PFNlcnZpY2VDb25maWd1cmF0aW9uIHhtbG5zOnhzZD0iaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEiIHhtbG5zOnhzaT0iaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEtaW5zdGFuY2UiIHhtbG5zPSJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL1NlcnZpY2VIb3N0aW5nLzIwMDgvMTAvU2VydmljZUNvbmZpZ3VyYXRpb24iPg0KICA8Um9sZSBuYW1lPSJjcmVhdGUtdGVzdC1pZHMyIj4NCiAgICA8SW5zdGFuY2VzIGNvdW50PSIxIiAvPg0KICA8L1JvbGU+DQo8L1NlcnZpY2VDb25maWd1cmF0aW9uPg==</Configuration><RoleInstanceList><RoleInstance><RoleName>create-test-ids2</RoleName><InstanceName>create-test-ids2</InstanceName><InstanceStatus>StoppedVM</InstanceStatus><InstanceUpgradeDomain>0</InstanceUpgradeDomain><InstanceFaultDomain>0</InstanceFaultDomain><InstanceSize>ExtraSmall</InstanceSize><InstanceStateDetails/><IpAddress>10.74.100.131</IpAddress><InstanceEndpoints><InstanceEndpoint><Name>ssh</Name><Vip>168.62.176.239</Vip><PublicPort>22</PublicPort><LocalPort>22</LocalPort><Protocol>tcp</Protocol></InstanceEndpoint></InstanceEndpoints><PowerState>Stopped</PowerState></RoleInstance></RoleInstanceList><UpgradeDomainCount>1</UpgradeDomainCount><RoleList>" +
    "<Role i:type=\"PersistentVMRole\"><RoleName>create-test-ids2</RoleName><OsVersion/><RoleType>PersistentVMRole</RoleType><ConfigurationSets><ConfigurationSet i:type=\"NetworkConfigurationSet\"><ConfigurationSetType>NetworkConfiguration</ConfigurationSetType><InputEndpoints><InputEndpoint><LocalPort>22</LocalPort><Name>ssh</Name><Port>22</Port><Protocol>tcp</Protocol><Vip>168.62.176.239</Vip></InputEndpoint></InputEndpoints><SubnetNames/></ConfigurationSet></ConfigurationSets><DataVirtualHardDisks/><OSVirtualHardDisk><HostCaching>ReadWrite</HostCaching><DiskName>create-test-ids2-create-test-ids2-0-20121111181413</DiskName><MediaLink>http://test-storage-account.blob.core.windows.net/vhd/create-test-ids2.vhd</MediaLink><SourceImageName>CANONICAL__Canonical-Ubuntu-12-04-amd64-server-20120528.1.3-en-us-30GB.vhd</SourceImageName><OS>Linux</OS></OSVirtualHardDisk><RoleSize>ExtraSmall</RoleSize></Role></RoleList><SdkVersion/><Locked>false</Locked><RollbackAllowed>false</RollbackAllowed><CreatedTime>2012-11-11T18:14:12Z</CreatedTime><LastModifiedTime>2012-11-11T18:14:37Z</LastModifiedTime><ExtendedProperties/><PersistentVMDowntime><StartTime>2012-10-21T18:20:20Z</StartTime><EndTime>2013-10-21T18:20:20Z</EndTime><Status>PersistentVMUpdateCompleted</Status></PersistentVMDowntime></Deployment></Deployments></HostedService>", { 'cache-control': 'no-cache',
      'content-length': '3287',
      'content-type': 'application/xml; charset=utf-8',
      server: '6.0.6002.18488 (rd_rdfe_stable.121021-2100) Microsoft-HTTPAPI/2.0',
      'x-ms-request-id': 'f46a3cf844644bdc89a5ee8253b0c7c3',
      date: 'Sun, 11 Nov 2012 18:15:15 GMT' });

  nock('https://management.core.windows.net')
    .get('/azure-account-subscription-id/services/hostedservices/test-reboot?embed-detail=true')
    .reply(404,helpers.loadFixture('azure/hosted-service-404.xml'),{})
    .post('/azure-account-subscription-id/services/hostedservices', helpers.loadFixture('azure/create-test-reboot-hosted-service.xml'))
    .reply(201, "", { 'cache-control': 'no-cache',
      'content-length': '0',
      location: 'https://management.core.windows.net/subscriptions/azure-account-subscription-id/compute/test-reboot',
      server: '6.0.6002.18488 (rd_rdfe_stable.121021-2100) Microsoft-HTTPAPI/2.0',
      'x-ms-request-id': '1a2c53d295b8451eb8fe902ea7ee478b',
      date: 'Sun, 11 Nov 2012 18:15:22 GMT' });

  nock('https://management.core.windows.net')
    .get('/azure-account-subscription-id/operations/1a2c53d295b8451eb8fe902ea7ee478b')
    .reply(200, "<Operation xmlns=\"http://schemas.microsoft.com/windowsazure\" xmlns:i=\"http://www.w3.org/2001/XMLSchema-instance\"><ID>1a2c53d2-95b8-451e-b8fe-902ea7ee478b</ID><Status>Succeeded</Status><HttpStatusCode>200</HttpStatusCode></Operation>", { 'cache-control': 'no-cache',
      'content-length': '232',
      'content-type': 'application/xml; charset=utf-8',
      server: '6.0.6002.18488 (rd_rdfe_stable.121021-2100) Microsoft-HTTPAPI/2.0',
      'x-ms-request-id': '399dec0dd9114bd59f8d759746d9bfcd',
      date: 'Sun, 11 Nov 2012 18:15:22 GMT' });

  nock('https://management.core.windows.net')
    .get('//azure-account-subscription-id/services/images/CANONICAL__Canonical-Ubuntu-12-04-amd64-server-20120528.1.3-en-us-30GB.vhd')
    .reply(200, "<OSImage xmlns=\"http://schemas.microsoft.com/windowsazure\" xmlns:i=\"http://www.w3.org/2001/XMLSchema-instance\"><Category>Canonical</Category><Label>Ubuntu Server 12.04 LTS</Label><LogicalSizeInGB>30</LogicalSizeInGB><Name>CANONICAL__Canonical-Ubuntu-12-04-amd64-server-20120528.1.3-en-us-30GB.vhd</Name><OS>Linux</OS><Eula>http://www.ubuntu.com/project/about-ubuntu/licensing</Eula><Description>Ubuntu Server 12.04 LTS amd64 20120528 Cloud Image</Description></OSImage>", { 'cache-control': 'no-cache',
      'content-length': '469',
      'content-type': 'application/xml; charset=utf-8',
      server: '6.0.6002.18488 (rd_rdfe_stable.121021-2100) Microsoft-HTTPAPI/2.0',
      'x-ms-request-id': 'ba75f04e6e8e444994d5b5fbb391f5d2',
      date: 'Sun, 11 Nov 2012 18:15:23 GMT' });

  nock('https://management.core.windows.net')
    .post('/azure-account-subscription-id/services/hostedservices/test-reboot/certificates', helpers.loadFixture('azure/add-certificate.xml'))
    .reply(202, "", { 'cache-control': 'no-cache',
      'content-length': '0',
      server: '6.0.6002.18488 (rd_rdfe_stable.121021-2100) Microsoft-HTTPAPI/2.0',
      'x-ms-request-id': '74abfbbe3998400cbc85fe044d4f1984',
      date: 'Sun, 11 Nov 2012 18:15:24 GMT' });

  nock('https://management.core.windows.net')
    .get('/azure-account-subscription-id/operations/74abfbbe3998400cbc85fe044d4f1984')
    .reply(200, "<Operation xmlns=\"http://schemas.microsoft.com/windowsazure\" xmlns:i=\"http://www.w3.org/2001/XMLSchema-instance\"><ID>74abfbbe-3998-400c-bc85-fe044d4f1984</ID><Status>Succeeded</Status><HttpStatusCode>200</HttpStatusCode></Operation>", { 'cache-control': 'no-cache',
      'content-length': '232',
      'content-type': 'application/xml; charset=utf-8',
      server: '6.0.6002.18488 (rd_rdfe_stable.121021-2100) Microsoft-HTTPAPI/2.0',
      'x-ms-request-id': '3ce77a4514df448bad5547af0f6b6ded',
      date: 'Sun, 11 Nov 2012 18:15:26 GMT' });

  nock('https://management.core.windows.net')
    .post('/azure-account-subscription-id/services/hostedservices/test-reboot/deployments', helpers.loadFixture('azure/create-test-reboot.xml'))
    .reply(202, "", { 'cache-control': 'no-cache',
      'content-length': '0',
      server: '6.0.6002.18488 (rd_rdfe_stable.121021-2100) Microsoft-HTTPAPI/2.0',
      'x-ms-request-id': 'f88c839335ad4e65a446fd666b259765',
      date: 'Sun, 11 Nov 2012 18:15:26 GMT' });

  nock('https://management.core.windows.net')
    .get('/azure-account-subscription-id/operations/f88c839335ad4e65a446fd666b259765')
    .reply(200, "<Operation xmlns=\"http://schemas.microsoft.com/windowsazure\" xmlns:i=\"http://www.w3.org/2001/XMLSchema-instance\"><ID>f88c8393-35ad-4e65-a446-fd666b259765</ID><Status>InProgress</Status></Operation>", { 'cache-control': 'no-cache',
      'content-length': '197',
      'content-type': 'application/xml; charset=utf-8',
      server: '6.0.6002.18488 (rd_rdfe_stable.121021-2100) Microsoft-HTTPAPI/2.0',
      'x-ms-request-id': '1f8854fdd32941e6ac9ed974b95c49e6',
      date: 'Sun, 11 Nov 2012 18:15:31 GMT' });

  nock('https://management.core.windows.net')
    .get('/azure-account-subscription-id/operations/f88c839335ad4e65a446fd666b259765')
    .reply(200, "<Operation xmlns=\"http://schemas.microsoft.com/windowsazure\" xmlns:i=\"http://www.w3.org/2001/XMLSchema-instance\"><ID>f88c8393-35ad-4e65-a446-fd666b259765</ID><Status>Succeeded</Status><HttpStatusCode>200</HttpStatusCode></Operation>", { 'cache-control': 'no-cache',
      'content-length': '232',
      'content-type': 'application/xml; charset=utf-8',
      server: '6.0.6002.18488 (rd_rdfe_stable.121021-2100) Microsoft-HTTPAPI/2.0',
      'x-ms-request-id': '40dabe289cc0470180ef32b93f14958d',
      date: 'Sun, 11 Nov 2012 18:16:25 GMT' });

  nock('https://management.core.windows.net')
    .get('/azure-account-subscription-id/services/hostedservices/test-reboot?embed-detail=true')
    .reply(200, "<HostedService xmlns=\"http://schemas.microsoft.com/windowsazure\" xmlns:i=\"http://www.w3.org/2001/XMLSchema-instance\"><Url>https://management.core.windows.net/azure-account-subscription-id/services/hostedservices/test-reboot</Url><ServiceName>test-reboot</ServiceName><HostedServiceProperties><Description>service created by pkgcloud</Description><Location>East US</Location><Label>dGVzdC1yZWJvb3Q=</Label><Status>Created</Status><DateCreated>2012-11-11T18:15:22Z</DateCreated><DateLastModified>2012-11-11T18:16:02Z</DateLastModified><ExtendedProperties/></HostedServiceProperties><Deployments><Deployment><Name>test-reboot</Name><DeploymentSlot>Production</DeploymentSlot><PrivateID>f12b338f99444c04ae7190b1a1fc0a0c</PrivateID><Status>Running</Status><Label>ZEdWemRDMXlaV0p2YjNRPQ==</Label><Url>http://test-reboot.cloudapp.net/</Url><Configuration>PFNlcnZpY2VDb25maWd1cmF0aW9uIHhtbG5zOnhzZD0iaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEiIHhtbG5zOnhzaT0iaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEtaW5zdGFuY2UiIHhtbG5zPSJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL1NlcnZpY2VIb3N0aW5nLzIwMDgvMTAvU2VydmljZUNvbmZpZ3VyYXRpb24iPg0KICA8Um9sZSBuYW1lPSJ0ZXN0LXJlYm9vdCI+DQogICAgPEluc3RhbmNlcyBjb3VudD0iMSIgLz4NCiAgPC9Sb2xlPg0KPC9TZXJ2aWNlQ29uZmlndXJhdGlvbj4=</Configuration><RoleInstanceList><RoleInstance><RoleName>test-reboot</RoleName><InstanceName>test-reboot</InstanceName><InstanceStatus>StoppedVM</InstanceStatus><InstanceUpgradeDomain>0</InstanceUpgradeDomain><InstanceFaultDomain>0</InstanceFaultDomain><InstanceSize>ExtraSmall</InstanceSize><InstanceStateDetails/><IpAddress>10.74.58.15</IpAddress><InstanceEndpoints><InstanceEndpoint><Name>ssh</Name><Vip>168.62.167.181</Vip><PublicPort>22</PublicPort><LocalPort>22</LocalPort><Protocol>tcp</Protocol></InstanceEndpoint></InstanceEndpoints><PowerState>Stopped</PowerState></RoleInstance></RoleInstanceList><UpgradeDomainCount>1</UpgradeDomainCount><RoleList>" +
    "<Role i:type=\"PersistentVMRole\"><RoleName>test-reboot</RoleName><OsVersion/><RoleType>PersistentVMRole</RoleType><ConfigurationSets><ConfigurationSet i:type=\"NetworkConfigurationSet\"><ConfigurationSetType>NetworkConfiguration</ConfigurationSetType><InputEndpoints><InputEndpoint><LocalPort>22</LocalPort><Name>ssh</Name><Port>22</Port><Protocol>tcp</Protocol><Vip>168.62.167.181</Vip></InputEndpoint></InputEndpoints><SubnetNames/></ConfigurationSet></ConfigurationSets><DataVirtualHardDisks/><OSVirtualHardDisk><HostCaching>ReadWrite</HostCaching><DiskName>test-reboot-test-reboot-0-20121111181533</DiskName><MediaLink>http://test-storage-account.blob.core.windows.net/vhd/test-reboot.vhd</MediaLink><SourceImageName>CANONICAL__Canonical-Ubuntu-12-04-amd64-server-20120528.1.3-en-us-30GB.vhd</SourceImageName><OS>Linux</OS></OSVirtualHardDisk><RoleSize>ExtraSmall</RoleSize></Role></RoleList><SdkVersion/><Locked>false</Locked><RollbackAllowed>false</RollbackAllowed><CreatedTime>2012-11-11T18:15:26Z</CreatedTime><LastModifiedTime>2012-11-11T18:16:05Z</LastModifiedTime><ExtendedProperties/><PersistentVMDowntime><StartTime>2012-10-21T18:20:20Z</StartTime><EndTime>2013-10-21T18:20:20Z</EndTime><Status>PersistentVMUpdateCompleted</Status></PersistentVMDowntime></Deployment></Deployments></HostedService>", { 'cache-control': 'no-cache',
      'content-length': '3211',
      'content-type': 'application/xml; charset=utf-8',
      server: '6.0.6002.18488 (rd_rdfe_stable.121021-2100) Microsoft-HTTPAPI/2.0',
      'x-ms-request-id': '68b2ebdd304c4a0fb97258935c7b79fd',
      date: 'Sun, 11 Nov 2012 18:16:27 GMT' });

  nock('https://management.core.windows.net')
    .post('/azure-account-subscription-id/services/hostedservices/test-reboot/deployments/test-reboot/roleInstances/test-reboot/Operations', '<RestartRoleOperation xmlns="http://schemas.microsoft.com/windowsazure" xmlns:i="http://www.w3.org/2001/XMLSchema-instance"><OperationType>RestartRoleOperation</OperationType></RestartRoleOperation>')
    .reply(202, "", { 'cache-control': 'no-cache',
      'content-length': '0',
      server: '6.0.6002.18488 (rd_rdfe_stable.121021-2100) Microsoft-HTTPAPI/2.0',
      'x-ms-request-id': 'd3cc1f3a13b148f29cea4e505367fdc3',
      date: 'Sun, 11 Nov 2012 18:16:30 GMT' });

  nock('https://management.core.windows.net')
    .get('/azure-account-subscription-id/operations/d3cc1f3a13b148f29cea4e505367fdc3')
    .reply(200, "<Operation xmlns=\"http://schemas.microsoft.com/windowsazure\" xmlns:i=\"http://www.w3.org/2001/XMLSchema-instance\"><ID>d3cc1f3a-13b1-48f2-9cea-4e505367fdc3</ID><Status>InProgress</Status></Operation>", { 'cache-control': 'no-cache',
      'content-length': '197',
      'content-type': 'application/xml; charset=utf-8',
      server: '6.0.6002.18488 (rd_rdfe_stable.121021-2100) Microsoft-HTTPAPI/2.0',
      'x-ms-request-id': '6f301af4113e430e9de117591ae5f621',
      date: 'Sun, 11 Nov 2012 18:16:29 GMT' });

  nock('https://management.core.windows.net')
    .get('/azure-account-subscription-id/operations/d3cc1f3a13b148f29cea4e505367fdc3')
    .reply(200, "<Operation xmlns=\"http://schemas.microsoft.com/windowsazure\" xmlns:i=\"http://www.w3.org/2001/XMLSchema-instance\"><ID>d3cc1f3a-13b1-48f2-9cea-4e505367fdc3</ID><Status>Succeeded</Status><HttpStatusCode>200</HttpStatusCode></Operation>", { 'cache-control': 'no-cache',
      'content-length': '232',
      'content-type': 'application/xml; charset=utf-8',
      server: '6.0.6002.18488 (rd_rdfe_stable.121021-2100) Microsoft-HTTPAPI/2.0',
      'x-ms-request-id': '5ed2375bc7e040128f184b85a6a47970',
      date: 'Sun, 11 Nov 2012 18:17:03 GMT' });

  nock('https://management.core.windows.net')
    .get('/azure-account-subscription-id/services/hostedservices/test-reboot?embed-detail=true')
    .reply(200, "<HostedService xmlns=\"http://schemas.microsoft.com/windowsazure\" xmlns:i=\"http://www.w3.org/2001/XMLSchema-instance\"><Url>https://management.core.windows.net/azure-account-subscription-id/services/hostedservices/test-reboot</Url><ServiceName>test-reboot</ServiceName><HostedServiceProperties><Description>service created by pkgcloud</Description><Location>East US</Location><Label>dGVzdC1yZWJvb3Q=</Label><Status>Created</Status><DateCreated>2012-11-11T18:15:22Z</DateCreated><DateLastModified>2012-11-11T18:16:02Z</DateLastModified><ExtendedProperties/></HostedServiceProperties><Deployments><Deployment><Name>test-reboot</Name><DeploymentSlot>Production</DeploymentSlot><PrivateID>f12b338f99444c04ae7190b1a1fc0a0c</PrivateID><Status>Running</Status><Label>ZEdWemRDMXlaV0p2YjNRPQ==</Label><Url>http://test-reboot.cloudapp.net/</Url><Configuration>PFNlcnZpY2VDb25maWd1cmF0aW9uIHhtbG5zOnhzZD0iaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEiIHhtbG5zOnhzaT0iaHR0cDovL3d3dy53My5vcmcvMjAwMS9YTUxTY2hlbWEtaW5zdGFuY2UiIHhtbG5zPSJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL1NlcnZpY2VIb3N0aW5nLzIwMDgvMTAvU2VydmljZUNvbmZpZ3VyYXRpb24iPg0KICA8Um9sZSBuYW1lPSJ0ZXN0LXJlYm9vdCI+DQogICAgPEluc3RhbmNlcyBjb3VudD0iMSIgLz4NCiAgPC9Sb2xlPg0KPC9TZXJ2aWNlQ29uZmlndXJhdGlvbj4=</Configuration><RoleInstanceList><RoleInstance><RoleName>test-reboot</RoleName><InstanceName>test-reboot</InstanceName><InstanceStatus>Provisioning</InstanceStatus><InstanceUpgradeDomain>0</InstanceUpgradeDomain><InstanceFaultDomain>0</InstanceFaultDomain><InstanceSize>ExtraSmall</InstanceSize><InstanceStateDetails/><IpAddress>10.74.58.15</IpAddress><InstanceEndpoints><InstanceEndpoint><Name>ssh</Name><Vip>168.62.167.181</Vip><PublicPort>22</PublicPort><LocalPort>22</LocalPort><Protocol>tcp</Protocol></InstanceEndpoint></InstanceEndpoints><PowerState>Started</PowerState></RoleInstance></RoleInstanceList><UpgradeDomainCount>1</UpgradeDomainCount><RoleList>" +
    "<Role i:type=\"PersistentVMRole\"><RoleName>test-reboot</RoleName><OsVersion/><RoleType>PersistentVMRole</RoleType><ConfigurationSets><ConfigurationSet i:type=\"NetworkConfigurationSet\"><ConfigurationSetType>NetworkConfiguration</ConfigurationSetType><InputEndpoints><InputEndpoint><LocalPort>22</LocalPort><Name>ssh</Name><Port>22</Port><Protocol>tcp</Protocol><Vip>168.62.167.181</Vip></InputEndpoint></InputEndpoints><SubnetNames/></ConfigurationSet></ConfigurationSets><DataVirtualHardDisks/><OSVirtualHardDisk><HostCaching>ReadWrite</HostCaching><DiskName>test-reboot-test-reboot-0-20121111181533</DiskName><MediaLink>http://test-storage-account.blob.core.windows.net/vhd/test-reboot.vhd</MediaLink><SourceImageName>CANONICAL__Canonical-Ubuntu-12-04-amd64-server-20120528.1.3-en-us-30GB.vhd</SourceImageName><OS>Linux</OS></OSVirtualHardDisk><RoleSize>ExtraSmall</RoleSize></Role></RoleList><SdkVersion/><Locked>false</Locked><RollbackAllowed>false</RollbackAllowed><CreatedTime>2012-11-11T18:15:26Z</CreatedTime><LastModifiedTime>2012-11-11T18:16:59Z</LastModifiedTime><ExtendedProperties/><PersistentVMDowntime><StartTime>2012-10-21T18:20:20Z</StartTime><EndTime>2013-10-21T18:20:20Z</EndTime><Status>PersistentVMUpdateCompleted</Status></PersistentVMDowntime></Deployment></Deployments></HostedService>", { 'cache-control': 'no-cache',
      'content-length': '3214',
      'content-type': 'application/xml; charset=utf-8',
      server: '6.0.6002.18488 (rd_rdfe_stable.121021-2100) Microsoft-HTTPAPI/2.0',
      'x-ms-request-id': '41d9f1e1436144419d8daa3efadd2950',
      date: 'Sun, 11 Nov 2012 18:17:03 GMT' });
};