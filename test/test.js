var loadModule = require('./load-module').loadModule
var chai = require('chai')
var beautiful = require('beautiful-lies')

chai.should()
var expect = chai.expect

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


function loadProvider() {
  var FitbitStepsProvider =
        loadModule('./provider.js', {
          'fitbit-js' : fitbit,
          'fitbit-credentials-provider': FitbitCredentialsProvider
        }).module.exports
  return FitbitStepsProvider.getInstance()
}

describe('fitbit-data-provider', function() {
  var liarHost;

  beforeEach(function() {
    beautiful.lie()
    liarHost = {}
  })
  afterEach (function() { delete Object.prototype.lie })

  function fitbitExpectsApiCall(credentialsExpected, pathExpected, returnsData) {

    if (!liarHost.fitbit) {
      liarHost.apiCallExpectations = []
      liarHost.lie({
        function_name: 'fitbit',
        check: function(apiKey, apiSecret) {
          return  apiKey === credentialsExpected.apiKey &&
                  apiSecret === credentialsExpected.apiSecret
        },
        returns: {
          on_value: liarHost.apiCallExpectations
        }
      })
    }

    liarHost.apiCallExpectations.push({
      function_name: 'apiCall',
      check: function(method, path, params, callback) {
        return  method  === 'GET' &&
                path    === pathExpected &&
                params.token.oauth_token        === credentialsExpected.token &&
                params.token.oauth_token_secret === credentialsExpected.tokenSecret
      },
      run_callback: { argument_3: { value: returnsData } }
    })

    return liarHost.fitbit;
  }


  describe("When fitbit expects a call to the steps resource path", function() {

    beforeEach(function() {
      fitbit = fitbitExpectsApiCall(
        credentials,
        '/user/-/activities/steps/date/2012-03-31/1m.json',
        {
          "activities-steps": [
            { dateTime: '2012-03-01', value: '0' },
            { dateTime: '2012-03-02', value: '0' },
            { dateTime: '2012-03-03', value: '0' },
            { dateTime: '2012-03-04', value: '0' },
            { dateTime: '2012-03-05', value: '0' },
            { dateTime: '2012-03-06', value: '0' },
            { dateTime: '2012-03-07', value: '0' },
            { dateTime: '2012-03-08', value: '0' },
            { dateTime: '2012-03-09', value: '0' },
            { dateTime: '2012-03-10', value: '0' },
            { dateTime: '2012-03-11', value: '0' },
            { dateTime: '2012-03-12', value: '0' },
            { dateTime: '2012-03-13', value: '0' },
            { dateTime: '2012-03-14', value: '0' },
            { dateTime: '2012-03-15', value: '0' },
            { dateTime: '2012-03-16', value: '0' },
            { dateTime: '2012-03-17', value: '0' },
            { dateTime: '2012-03-18', value: '0' },
            { dateTime: '2012-03-19', value: '0' },
            { dateTime: '2012-03-20', value: '0' },
            { dateTime: '2012-03-21', value: '0' },
            { dateTime: '2012-03-22', value: '0' },
            { dateTime: '2012-03-23', value: '0' },
            { dateTime: '2012-03-24', value: '0' },
            { dateTime: '2012-03-25', value: '0' },
            { dateTime: '2012-03-26', value: '0' },
            { dateTime: '2012-03-27', value: '0' },
            { dateTime: '2012-03-28', value: '6188' },
            { dateTime: '2012-03-29', value: '16232' },
            { dateTime: '2012-03-30', value: '13157' },
            { dateTime: '2012-03-31', value: '12130' },
          ]
        })

      fitbit = fitbitExpectsApiCall(
        credentials,
        '/user/-/activities/steps/date/2012-05-01/1m.json',
        {
          "activities-steps": [
            { dateTime: '2012-04-01', value: '11802' },
            { dateTime: '2012-04-02', value: '19446' },
            { dateTime: '2012-04-03', value: '10461' },
            { dateTime: '2012-04-04', value: '10503' },
            { dateTime: '2012-04-05', value: '14539' },
            { dateTime: '2012-04-06', value: '4969' },
            { dateTime: '2012-04-07', value: '5909' },
            { dateTime: '2012-04-08', value: '9931' },
            { dateTime: '2012-04-09', value: '12865' },
            { dateTime: '2012-04-10', value: '14630' },
            { dateTime: '2012-04-11', value: '9007' },
            { dateTime: '2012-04-12', value: '10606' },
            { dateTime: '2012-04-13', value: '13281' },
            { dateTime: '2012-04-14', value: '7347' },
            { dateTime: '2012-04-15', value: '21009' },
            { dateTime: '2012-04-16', value: '16013' },
            { dateTime: '2012-04-17', value: '11941' },
            { dateTime: '2012-04-18', value: '11821' },
            { dateTime: '2012-04-19', value: '13574' },
            { dateTime: '2012-04-20', value: '16036' },
            { dateTime: '2012-04-21', value: '9503' },
            { dateTime: '2012-04-22', value: '6358' },
            { dateTime: '2012-04-23', value: '15436' },
            { dateTime: '2012-04-24', value: '13525' },
            { dateTime: '2012-04-25', value: '8259' },
            { dateTime: '2012-04-26', value: '11102' },
            { dateTime: '2012-04-27', value: '16030' },
            { dateTime: '2012-04-28', value: '7025' },
            { dateTime: '2012-04-29', value: '18498' },
            { dateTime: '2012-04-30', value: '23071' },
            { dateTime: '2012-05-01', value: '19409' }
          ]
        })
    })


    describe('and we call getSteps', function() {

      beforeEach(function(done) {
        var provider = loadProvider()

        var startDate = new Date(2012, 2, 1) // 1st march
        var endDate = new Date(2012, 3, 30)  // 30th april
        provider.getSteps(startDate, endDate, function(err, steps) {
          result = steps
          done()
        })
      })

      it('should return correct data for the first item', function() {
        result['2012-03-01'].should.equal(0)
      })

      it('should return correct data for the first day walked', function() {
        result['2012-03-28'].should.equal(6188)
      })

      it('should retrive the data from the second month as well', function() {
        result['2012-04-01'].should.equal(11802)
      })

      it('should discard overflowing data', function() {
        expect(result['2012-05-01']).to.be.undefined
      })
      /*
      it('should return it as simple step data', function() {
        result['2012-05-01'].should.equal(5490)
        result['2011-04-28'].should.equal(2344)
        result['2011-04-29'].should.equal(2779)
      })*/

    })

  })

  xdescribe("When fitbit expects a call to the body weight resource path", function() {

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

  xdescribe('given that the fitbit client returns an error', function() {
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



