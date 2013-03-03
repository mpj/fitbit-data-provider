var fitbit = require('fitbit-js')
var FitbitCredentialsProvider = require('fitbit-credentials-provider')

function FitbitDataProvider() {}

FitbitDataProvider.getInstance = function() {
  return new FitbitDataProvider()
}

FitbitDataProvider.prototype.getSteps = function(endDate, callback) {
  apiMonth(endDate, 'activities/steps', function(error, points){
    if (points) {
      var map = {}
      points.forEach(function(p) {
        map[p.dateTime] = parseFloat(p.value)
      })
    }
    callback(error, map)
  })
}

FitbitDataProvider.prototype.getWeight = function(endDate, callback) {
  apiMonth(endDate, 'body/log/weight', function(error, points) {
    if(points) {
      var map = {}
      points.forEach(function(p) {
        map[p.date] = p.weight
      })
    }
    callback(error, map)
  })
}

// Gets a month worth of data - 30 days before
// endDate provided.
function apiMonth(endDate, resourcePath, callback) {

  var credentialsProvider = FitbitCredentialsProvider.getInstance()
  var credentials = credentialsProvider.get()
  var client = fitbit(credentials.apiKey, credentials.apiSecret)

  var method = 'GET'
  var url = '/user/-/' + resourcePath + '/date/' + dateToYMD(endDate) +'/1m.json'

  var params = {
    token: {
      oauth_token: credentials.token,
      oauth_token_secret: credentials.tokenSecret
    }
  }

  client.apiCall(method, url, params, function(error, resp, data) {
    var points, property, output

    if (error) {
      callback({
        message: 'Error retrieving data from Fitbit. See innerError property for more info.',
        innerError: error
      }, null)
      return
    }

    // The array of data that we want will always
    // be contained in a single property on the data
    // object. Just get whatever is in the first and
    // only property:
    for (propertyName in data) break;

    callback(null, data[propertyName])
  })

}

function dateToYMD(date) {
    var d = date.getDate()
    var m = date.getMonth() + 1
    var y = date.getFullYear()
    return '' + y + '-' + (m<=9 ? '0' + m : m) + '-' + (d <= 9 ? '0' + d : d);
}

module.exports = FitbitDataProvider
