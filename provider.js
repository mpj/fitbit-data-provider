var fitbit = require('fitbit-js')
var FitbitCredentialsProvider = require('fitbit-credentials-provider')

function FitbitStepsProvider() {}

FitbitStepsProvider.getInstance = function() {
  return new FitbitStepsProvider()
}

FitbitStepsProvider.prototype.getSteps = function(callback) {

  var credentialsProvider = FitbitCredentialsProvider.getInstance()
  var credentials = credentialsProvider.get()

  var client = fitbit(credentials.apiKey, credentials.apiSecret)
  client.apiCall(
    'GET',
    '/user/-/activities/steps/date/today/7d.json',
    {
      token: {
        oauth_token: credentials.token,
        oauth_token_secret: credentials.tokenSecret
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

module.exports = FitbitStepsProvider
