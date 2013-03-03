var loadModule = require('./load-module').loadModule
var chai = require('chai')
chai.should()

var fitbit, result,  FitbitCredentials

var credentials = {
  apiKey: 'api123',
  apiSecret: 'apiSecret456',
  token: 'token123',
  tokenSecret: 'secret456'
}

FitbitCredentialsProvider = {
  getInstance: function() {
    return {
      get: function() {
        return credentials
      }
    }
  }
}

function fitbitExpectsApiCall(credentialsExpected, pathExpected, returnsData) {
  return function(apiKey, apiSecret) {
    apiKey.should.equal(credentialsExpected.apiKey)
    apiSecret.should.equal(credentialsExpected.apiSecret);
    return {
      apiCall: function(method, path, params, callback) {
        method.should.equal('GET')
        path.should.equal(pathExpected)
        with(params.token) {
          oauth_token.should.equal(credentialsExpected.token)
          oauth_token_secret.should.equal(credentialsExpected.tokenSecret)
        }
        callback(null, null, returnsData)
      }
    }
  }
}

function loadProvider() {
  var FitbitStepsProvider =
        loadModule('./provider.js', {
          'fitbit-js' : fitbit,
          'fitbit-credentials-provider': FitbitCredentialsProvider
        }).module.exports
  return FitbitStepsProvider.getInstance()
}


describe("When fitbit expects a call to the steps resource path", function() {

  beforeEach(function() {
    fitbit = fitbitExpectsApiCall(
      credentials,
      '/user/-/activities/steps/date/today/max.json',
      {
        "activities-steps":[
          {"dateTime":"2011-04-27","value":"5490"},
          {"dateTime":"2011-04-28","value":"2344"},
          {"dateTime":"2011-04-29","value":"2779"}
        ]
      })
  })


  describe('and we call getSteps', function() {

    beforeEach(function(done) {
      var provider = loadProvider()
      provider.getSteps(function(err, steps) {
        result = steps
        done()
      })
    })

    it('should return it as simple step data', function() {
      result['2011-04-27'].should.equal(5490)
      result['2011-04-28'].should.equal(2344)
      result['2011-04-29'].should.equal(2779)
    })

  })

})

describe("When fitbit expects a call to the body weight resource path", function() {

  beforeEach(function() {
    fitbit = fitbitExpectsApiCall(
      credentials,
      '/user/-/body/weight/date/today/max.json',
      {
        "body-weight":[
          {"dateTime":"2012-05-16","value":"76.7"},
          {"dateTime":"2012-05-17","value":"76.9"},
          {"dateTime":"2012-05-18","value":"76.5"}
        ]
      })
  })


  describe('and we call getWeights', function() {

    beforeEach(function(done) {
      var provider = loadProvider()
      provider.getWeight(function(err, weight) {
        result = weight
        done()
      })
    })

    it('should return it as simple weight data', function() {
      result['2012-05-16'].should.equal(76.7)
      result['2012-05-17'].should.equal(76.9)
      result['2012-05-18'].should.equal(76.5)
    })

  })

})

describe('given that the fitbit client returns an error', function() {
  var fakeError = { message: "error!" }
  beforeEach(function() {
    fitbit = function(apiKey, apiSecret) {
      return {
        apiCall: function(method, path, params, callback) {
          callback(fakeError, null)
        }
      }
    }
  })

  describe('calls getSteps', function() {
    var error;
    beforeEach(function(done) {
      var stepProvider = loadProvider()
      stepProvider.getSteps(function(err, steps) {
        error = err
        done()
      })
    })

    it('should have provide a nice error message', function() {
      error.message.should.equal('Error retrieving data from Fitbit. See innerError property for more info.')
    })

    it('should have provide a nice error type', function() {
      error.innerError.should.equal(fakeError)
    })
  })

})

