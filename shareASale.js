const sendHttpGet = require('sendHttpGet');
const sha256 = require('sha256');
const logToConsole = require('logToConsole');
const JSON = require('JSON');


var my_merchant_id = data.merchant_id;
var api_token      = data.api_token;
var api_secret_key = data.api_secret;
var api_version    = 3.0;
var action_verb    = 'new';
var my_timestamp   = data.date;
var sscid = data.sscid;

// authentication
var sig        = api_token + ":" + my_timestamp + ":" + action_verb + ":" + api_secret_key;

var url  = 'https://api.shareasale.com';
var path = '/w.cfm?sscid='+ sscid +'&merchantId=' + my_merchant_id + '&token=' + api_token + '&version=' + api_version +'&action=' + action_verb +'&transtype=sale&amount='+ data.amount +'&tracking='+ data.order_number;
// may need &userId=xxx
var auth = "";
logToConsole('url: ' + url + path);
sha256(sig, (digest) => {
  logToConsole('digest: ' + digest);
  auth = digest;
  var share_headers = {'x-ShareASale-Date' : my_timestamp, 'x-ShareASale-Authentication' : digest};
  sendHttpGet(
        url + path,
        (statusCode, headers, body) => {
          logToConsole(
            JSON.stringify({
              Name: 'sending Request',
              Type: 'Response',
              ResponseStatusCode: statusCode,
              ResponseHeaders: headers,
              ResponseBody: body,
            })
          );
          if (!data.useOptimisticScenario) {
            if (statusCode >= 200 && statusCode < 400) {
              logToConsole(
                JSON.stringify({
                  Name: 'Send Data',
                  Type: 'Success',
                  StatusCode: statusCode,
                })
              );
               data.gtmOnSuccess();
            } else {
              data.gtmOnFailure();
            }
          }
        },
        {
          headers: share_headers,
          method: 'GET',
        }
      );
});

data.gtmOnSuccess();