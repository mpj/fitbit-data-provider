var loadModule = require('./load-module').loadModule
var chai = require('chai')
chai.should()

var fitbit, result, FitbitCredentials

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

describe("given a faux fitbit client", function() {

  beforeEach(function() {

    fitbit = function(apiKey, apiSecret) {
      apiKey.should.equal(credentials.apiKey)
      apiSecret.should.equal(credentials.apiSecret);
      return {
        apiCall: function(method, path, params, callback) {
          method.should.equal('GET')
          path.should.equal('/user/-/activities/steps/date/today/7d.json')
          with(params.token) {
            oauth_token.should.equal(credentials.token)
            oauth_token_secret.should.equal(credentials.tokenSecret)
          }
          callback(null, null, JSON.stringify({
            "activities-steps":[
              {"dateTime":"2011-04-27","value":5490},
              {"dateTime":"2011-04-28","value":2344},
              {"dateTime":"2011-04-29","value":2779}
            ]
          }))
        }
      }
    }
  })


  describe('calls getSteps', function() {

    beforeEach(function(done) {
      var stepProvider =
        loadModule('./provider.js', {
          'fitbit-js' : fitbit,
          'fitbit-credentials-provider': FitbitCredentialsProvider
        }).exports
      stepProvider.getSteps(function(err, steps) {
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
    beforeEach(function(done) {
      var stepProvider = loadModule('./provider.js', {
        'fitbit-js': fitbit,
        'fitbit-credentials-provider': FitbitCredentialsProvider
      }).exports;
      stepProvider.getSteps(function(err, steps) {
        result = err
        done()
      })
    })

    it('should have provide a nice error message', function() {
      result.message.should.equal('Error retrieving data from Fitbit. See innerError property for more info.')
    })

    it('should have provide a nice error type', function() {
      result.innerError.should.equal(fakeError)
    })
  })

})

