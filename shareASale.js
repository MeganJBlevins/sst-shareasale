const sendHttpGet = require('sendHttpGet');
const sha256 = require('sha256');
const getTimestampMillis = require('getTimestampMillis');
const logToConsole = require('logToConsole');
const JSON = require('JSON');


var my_merchant_id = data.merchant_id;
var api_token      = data.api_token;
var api_secret_key = data.api_secret;
var api_version    = 3.0;
var action_verb    = 'new';
var my_timestamp   = getTimestampMillis();

// authentication
var sig        = api_token + ":" + my_timestamp + ":" + action_verb + ":" + api_secret_key;

var url  = 'https://shareasale.com';
var path = '/w.cfm?tracking=' + data.order_number + '&amount=' + data.amount + '&merchantID=' + data.merchant_id + '&transtype=sale&token=' + data.api_token + '&version=3.0';
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
