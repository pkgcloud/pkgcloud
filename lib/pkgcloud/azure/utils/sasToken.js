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

/**
 * Creates a new Shared Accees Signature object.
 *
 * @constructor
 * @param {string} storageAccount    The storage account.
 * @param {string} sasToken  The storage account's SAS token.
 */
function SASToken(storageAccount, sasToken) {
    this.storageAccount = storageAccount;
    this.sasToken = sasToken;
  }
  
  /**
   * Signs a request by adding the Shared Accees Signature to the query.
   *
   * @param {req} The request request object.
   * @return {undefined}
   */
  SASToken.prototype.signRequest = function (req) {
  
      var queries = this.sasToken.split(/[\?&]+/);
      queries.forEach(element => {
        var elementParts = element.split(/=/);
  
        if (!req.qs) {
          req.qs = {};
        }
        req.qs[elementParts[0]] = elementParts[1];
      });
  
      // do not stringify the SAS token otherwise it becomes invalid
      if (!req.qsStringifyOptions) {
        req.qsStringifyOptions = {};
      }
      req.qsStringifyOptions['encode'] =  false;
  };
  
  
  // Expose 'SASToken'.
  exports = module.exports = SASToken;