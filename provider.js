var fitbit = require('fitbit-js')
var FitbitCredentialsProvider = require('fitbit-credentials-provider')

function FitbitDataProvider() {}

FitbitDataProvider.getInstance = function() {
  return new FitbitDataProvider()
}

var addDays = function(date, days) {
  var newDate = new Date(date.getTime(date))
  newDate.setDate(date.getDate() + days)
  return newDate
}

var parseFitbitDate = function(str) {
  var parts = str.split('-')
  return new Date(parts[0], parts[1] - 1, parts[2])
}

FitbitDataProvider.prototype.getSteps = function(startDate, endDate, callback) {

  var map = {}
  var cursor = addDays(startDate, -1) // -1 because the startDate is inclusive

  var getOneMoreMonth = function() {
    cursor = addDays(cursor, 31)
    apiMonth(cursor, 'activities/steps', function(error, points){
      if (points) {
        points.forEach(function(p) {
          if(parseFitbitDate(p.dateTime) < endDate)
            map[p.dateTime] = parseFloat(p.value)
        })
      }
      if (cursor > endDate)
        callback(error, map)
      else
        getOneMoreMonth()
    })
  }
  getOneMoreMonth()

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
