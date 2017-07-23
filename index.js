var express = require('express')
var app = express()
var path = require("path");
var bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.set('port', (process.env.PORT || 8000))
app.use(express.static(__dirname + '/public'))

app.get('/', function (request, response) {
  response.sendFile(path.join(__dirname + '/public/index.html'));
})

app.listen(app.get('port'), function () {
  console.log("Node app is running at http://localhost:" + app.get('port'))
})
