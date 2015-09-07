'use strict';

/**
 * QStringify is used to pass an array or object of queries to the correct format needed for Openstack Ceilometer.
 * This function immediately makes a string because there can exist multiple q.name keys (for example)
 *
 * A lot of variations of the obj can be accepted:
 *
 * var obj = {
 *      q: [        //ARRAYS are translated to string: q.field=timestamp&q.op=ge&q.value=2014-04-01T13:34:17&q.field=resource_id.....
 *          {
 *          "field": "timestamp",
 *          "op": "ge",
 *          "value": "2014-04-01T13:34:17"
 *          },{
 *          "field": "resource_id",
 *          "op": "eq",
 *          "value": "4da2b992-0dc3-4a7c-a19a-d54bf918de41"}
 *       ],
 *
 *      direct: true,   //Keys and values are translated to:  direct=true
 *
 *      q: {            // Also objects get translated perfectly: q.field=timestamp&q.op=ge&q.value=2014-04-01T13:34:17
 *          "field": "timestamp",
 *          "op": "ge",
 *          "value": "2014-04-01T13:34:17"
 *         },
 *      groupby: [       //Arrays are translated to : groupby=resource_id&groupby=timestamp
 *          'resource_id',
 *          'timestamp'
 *      ]
 * }  // Deeper objects or strings or arrays will be ignored!!
 *
 * @param obj           Options object      see above for examples
 * @returns {string}    String              The stringified queryfilters (as needed by the Ceilometer Web API)
 *
 *
 * More info:
 *
 * http://docs.openstack.org/developer/ceilometer/webapi/v2.html
 *
 */

module.exports.stringify = function QStringify (obj) {
    var z = [];

    for (var x in obj) {
        if (obj.hasOwnProperty(x) && Array.isArray(obj[x])) {
            for ( var w in obj[x] ) {
                //Contains a pure array of strings
                if (obj[x][w] && obj[x].hasOwnProperty(w) && typeof obj[x][w] === 'string') {
                    z.push( encodeURIComponent(x) + '=' + encodeURIComponent(obj[x][w]));
                } else {
                    //Array contains JSON objects
                    for (var q in obj[x][w]) {
                        if (obj[x][w][q] && obj[x][w].hasOwnProperty(q)) {
                            z.push(encodeURIComponent(x) + '.' + encodeURIComponent(q) + '=' + encodeURIComponent(obj[x][w][q]));
                        }
                    }
                }
            }
        } else if (obj[x] instanceof Object) {
            //Contains A standard Json object
            for(var t in obj[x]) {
                if (obj[x][t] && obj[x].hasOwnProperty(t)) z.push(encodeURIComponent(x) + '.' + encodeURIComponent(t) + '=' + encodeURIComponent(obj[x][t]));
            }
        } else {
            //Object IS a JSON object
            z.push(encodeURIComponent(x) + '=' + encodeURIComponent(obj[x]));
        }
    }
    return '?' + z.join('&');
};
