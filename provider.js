var fitbit = require('fitbit-js')

module.exports.getSteps = function(apiKey, apiSecret, oAuthToken, oAuthTokenSecret, callback) {
  var client = fitbit(apiKey, apiSecret);
  client.apiCall(
    'GET',
    '/1/user/-/activities/steps/date/today/7d.json',
    {
      token: {
        oauth_token: oAuthToken,
        oauth_token_secret: oAuthTokenSecret
      }
    }, function(err, resp, json) {
      var map = {}
      var steps = json['activities-log-steps'];
      steps.forEach(function(s) { map[s.dateTime] = s.value })
      callback(null, map);
    })
}
