var fitbit = require('fitbit-js')
var FitbitCredentialsProvider = require('fitbit-credentials-provider')

function FitbitStepsProvider() {}

FitbitStepsProvider.getInstance = function() {
  return new FitbitStepsProvider()
}

FitbitStepsProvider.prototype.getSteps = function(callback) {
  getTimeSeriesMax('activities/steps', callback)
}

FitbitStepsProvider.prototype.getWeight = function(callback) {
  getTimeSeriesMax('body/weight', callback)
}

function getTimeSeriesMax(resourcePath, callback) {

  var credentialsProvider = FitbitCredentialsProvider.getInstance()
  var credentials = credentialsProvider.get()
  var client = fitbit(credentials.apiKey, credentials.apiSecret)

  var method = 'GET'
  var url = '/user/-/' + resourcePath + '/date/today/max.json'
  var params = {
    token: {
      oauth_token: credentials.token,
      oauth_token_secret: credentials.tokenSecret
    }
  }

  client.apiCall(method, url, params, function(error, resp, data) {
    var points, property, map

    if (error) {
      callback({
        message: 'Error retrieving data from Fitbit. See innerError property for more info.',
        innerError: error
      }, null)
      return
    }

    // Example: If the resource path is 'activities/steps',
    // the name of the property will be 'activities-steps'
    propertyName = resourcePath.replace('/', '-')
    points = data[propertyName]

    map = {}
    points.forEach(function(p) { map[p.dateTime] = p.value })
    callback(null, map)
  })

}

module.exports = FitbitStepsProvider
