var express = require('express');
var connect = require('connect');
var app = express();
var FitbitCredentialsProvider = require('fitbit-credentials-provider')

app.use(connect.cookieParser('session secret hooray'));
  app.use(connect.session({ secret: "session secret hooray" }));
  app.use(express.methodOverride());
  app.use(app.router);

var fitbit = require('fitbit-js')

var port = 3000;

app.get('/', function (req, res) {

  var absoluteUri = req.protocol + '://' + req.host  +
    ( !port || port == 80 || port == 443 ? '' : ':'+port ) + req.path;

  var apiKey    = 'df6b2dcad1b445afb2c2f1e23659614d'
  var apiSecret = 'd0b2b5cb19a14e958ceab40c444347b5'

  var client = fitbit(apiKey, apiSecret, absoluteUri)
  client.getAccessToken(req, res, function (error, newToken) {
    if(newToken) {
      token = newToken;
      x§
      var credentialsProvider = FitbitCredentialsProvider.getInstance()
      credentialsProvider.set({
        apiKey:       apiKey,
        apiSecret:    apiSecret,
        token:        token.oauth_token,
        tokenSecret:  token.oauth_token_secret
      })

      var stepsProvider = require('./provider.js')
      stepsProvider.getSteps(function(err, steps) {
          console.log("arguments cb getSteps", arguments )
          res.writeHead(200, {'Content-Type':'text/html'});
          res.end('<html>'+token.oauth_token+'/'+token.oauth_token_secret+'</html>');
        });
    }
  });



})

app.listen(port);
console.log('Server running at port 3000');