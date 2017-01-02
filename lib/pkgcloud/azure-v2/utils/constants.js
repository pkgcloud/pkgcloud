/**
* Copyright (c) Microsoft.  All rights reserved.
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

var Constants = {
  /** Uri endpoint for accessing blob storage */
  MANAGEMENT_API_VERSION: '2016-03-30',
  /** Endpoint for azure management */
  MANAGEMENT_ENDPOINT: 'management.core.windows.net',
  /** Uri endpoint for accessing blob storage */
  STORAGE_URI_SUFFIX: 'blob.core.windows.net',
  /** Azure credentials refresh rate in milliseconds */
  CREDENTIALS_LIFESPAN: 5000,
  /** default api version when querying ARM resrouces */
  DEFAULT_API_VERSION: '2016-03-30',
  /** Default size for new storage account */
  DEFAULT_STORAGE_SKU: 'Standard_LRS',
  /** Default container to work with when none is specified */
  DEFAULT_STORAGE_CONTAINER: 'pkgcloud-container',
  /** Default Image details when creating VM from image */
  DEFAULT_VM_IMAGE: {
    PUBLISHER: 'MicrosoftWindowsServer',
    OFFER: 'WindowsServer',
    SKU: '2012-R2-Datacenter'
  }
};

module.exports = Constants;