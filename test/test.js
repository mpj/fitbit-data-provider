var loadModule = require('./load-module').loadModule
var chai = require('chai')
chai.should()

describe("given a faux fitbit client", function() {

  var fitbit, result

  beforeEach(function() {
    fitbit = function(apiKey, apiSecret) {
      apiKey.should.equal('api123')
      apiSecret.should.equal('apiSecret456');
      return {
        apiCall: function(method, path, params, callback) {
          method.should.equal('GET')
          path.should.equal('/1/user/-/activities/steps/date/today/7d.json')
          with(params.token) {
            oauth_token.should.equal('token123')
            oauth_token_secret.should.equal('secret456')
          }
          callback(null, null, {
            "activities-log-steps":[
              {"dateTime":"2011-04-27","value":5490},
              {"dateTime":"2011-04-28","value":2344},
              {"dateTime":"2011-04-29","value":2779}
            ]
          })
        }
      }
    }
  })


  describe('calls getSteps', function() {

    beforeEach(function(done) {
      var stepProvider =
        loadModule('./provider.js', { 'fitbit-js' : fitbit }).exports
      stepProvider.getSteps('api123', 'apiSecret456', 'token123', 'secret456', function(err, steps) {
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