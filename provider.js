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

var getResource = function(path, startDate, endDate, mapperFunc, callback) {
  var map = {}
  var cursor = addDays(startDate, -1) // -1 because the startDate is inclusive

  var getOneMoreMonth = function() {
    cursor = addDays(cursor, 31)
    apiMonth(cursor, path, function(error, points) {
      if(error) return callback(error, null)
      points.forEach(function(p) {
        mapperFunc(map, p)
      })
      if (cursor > endDate) callback(null, map)
      else getOneMoreMonth()
    })
  }
  getOneMoreMonth()
}

FitbitDataProvider.prototype.getSteps = function(startDate, endDate, callback) {
  getResource('activities/steps', startDate, endDate, function mapper(map, point) {
    if(parseFitbitDate(point.dateTime) < endDate)
      map[point.dateTime] = parseFloat(point.value)
  }, callback)
}

FitbitDataProvider.prototype.getWeight = function(startDate, endDate, callback) {
  getResource('body/log/weight', startDate, endDate, function mapper(map, point) {
    if(parseFitbitDate(point.date) < endDate)
      map[point.date] = point.weight
  }, callback)
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
