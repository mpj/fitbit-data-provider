var loadModule = require('./load-module').loadModule
var chai = require('chai')
var beautiful = require('beautiful-lies')

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
  var holder = {}
  holder.lie({
    function_name: 'fitbit',
    check: function(apiKey, apiSecret) {
      return  apiKey === credentialsExpected.apiKey &&
              apiSecret === credentialsExpected.apiSecret
    },
    returns: { on_value: {
      function_name: 'apiCall',
      check: function(method, path, params, callback) {
        return  method  === 'GET' &&
                path    === pathExpected &&
                params.token.oauth_token        === credentialsExpected.token &&
                params.token.oauth_token_secret === credentialsExpected.tokenSecret
      },
      run_callback: { argument_3: { value: returnsData } }
    } }
  })
  return holder.fitbit;

}

function loadProvider() {
  var FitbitStepsProvider =
        loadModule('./provider.js', {
          'fitbit-js' : fitbit,
          'fitbit-credentials-provider': FitbitCredentialsProvider
        }).module.exports
  return FitbitStepsProvider.getInstance()
}

describe('fitbit-data-provider', function() {

  beforeEach(function() { beautiful.lie() })
  afterEach(function() { delete Object.prototype.lie })

  describe("When fitbit expects a call to the steps resource path", function() {

    beforeEach(function() {
      fitbit = fitbitExpectsApiCall(
        credentials,
        '/user/-/activities/steps/date/2011-05-01/1m.json',
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
        var date = new Date(2011, 4, 1)
        provider.getSteps(date, function(err, steps) {
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
        '/user/-/body/log/weight/date/2013-04-01/1m.json',
        {
          weight: [
            {
              bmi: 24.54,
              date: '2012-03-23',
              logId: 1332547199000,
              time: '23:59:59',
              weight: 66
            },{
              bmi: 24.54,
              date: '2012-03-28',
              logId: 1332979199000,
              time: '23:59:59',
              weight: 66.7
            },{
              bmi: 24.76,
              date: '2012-04-01',
              logId: 1333324799000,
              time: '23:59:59',
              weight: 66.6
            }
          ]
        })
    })

    describe('and we call getWeights', function() {

      beforeEach(function(done) {
        var date = new Date(2013, 3, 1)
        var provider = loadProvider()
        provider.getWeight(date, function(err, weight) {
          result = weight
          done()
        })
      })

      it('should return it as simple weight data', function() {
        result['2012-03-23'].should.equal(66)
        result['2012-03-28'].should.equal(66.7)
        result['2012-04-01'].should.equal(66.6)
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
        stepProvider.getSteps(new Date(), function(err, steps) {
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

    describe('calls getWeight', function() {
      var error;
      beforeEach(function(done) {
        var stepProvider = loadProvider()
        stepProvider.getWeight(new Date(), function(err, steps) {
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

})



