var fitbit = require('fitbit-js')

module.exports.getSteps = function(apiKey, apiSecret, oAuthToken, oAuthTokenSecret, callback) {
  var client = fitbit(apiKey, apiSecret);
  client.apiCall(
    'GET',
    '/user/-/activities/steps/date/today/7d.json',
    {
      token: {
        oauth_token: oAuthToken,
        oauth_token_secret: oAuthTokenSecret
      }
    }, function(error, resp, json) {
      var steps, map;

      if (error) {
        callback({
          message: 'Error retrieving data from Fitbit. See innerError property for more info.',
          innerError: error
        }, null);
        return;
      }

      steps = JSON.parse(json)['activities-steps']
      map = {}
      steps.forEach(function(s) { map[s.dateTime] = s.value })
      callback(null, map);
    })
}
