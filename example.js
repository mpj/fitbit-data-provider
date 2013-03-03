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
      var credentialsProvider = FitbitCredentialsProvider.getInstance()
      credentialsProvider.set({
        apiKey:       apiKey,
        apiSecret:    apiSecret,
        token:        token.oauth_token,
        tokenSecret:  token.oauth_token_secret
      })

      var FitbitDataProvider = require('./provider.js')
      var dataProvider = FitbitDataProvider.getInstance()
      dataProvider.getSteps(function(err, steps) {
        res.writeHead(200, {'Content-Type':'text/html'});
        res.end('<html>'+token.oauth_token+'/'+token.oauth_token_secret+JSON.stringify(steps)+'</html>');
      });



      dataProvider.getWeight(function(err, weight) {
        if(err) {
          console.log("getWeight err", err)
        } else {
          console.log("*** WEIGHT", weight)
        }
      });
    }
  });



})

app.listen(port);
console.log('Server running at port 3000');