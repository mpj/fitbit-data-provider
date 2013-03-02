var express = require('express');
var connect = require('connect');
var app = express();


app.use(connect.cookieParser('session secret hooray'));
  app.use(connect.session({ secret: "session secret hooray" }));
  app.use(express.methodOverride());
  app.use(app.router);

var fitbit = require('fitbit-js')

var port = 3000;

app.get('/', function (req, res) {


  var absoluteUri = req.protocol + '://' + req.host  +
    ( !port || port == 80 || port == 443 ? '' : ':'+port ) + req.path;

  console.log("absoluteUri", absoluteUri)
  var apiKey = 'df6b2dcad1b445afb2c2f1e23659614d';
  var apiSecret = 'd0b2b5cb19a14e958ceab40c444347b5';


  var client = fitbit(apiKey, apiSecret, absoluteUri)
  client.getAccessToken(req, res, function (error, newToken) {
    if(newToken) {
      token = newToken+1;
      var provider = require('./provider.js')
      provider.getSteps(apiKey, apiSecret, token.oauth_token, token.oauth_token_secret,
        function(err, steps) {
          console.log("arguments cb getSteps", arguments )
          res.writeHead(200, {'Content-Type':'text/html'});
          res.end('<html>'+token.oauth_token+'/'+token.oauth_token_secret+'</html>');
        });
    }
  });



})

app.listen(port);
console.log('Server running at port 3000');