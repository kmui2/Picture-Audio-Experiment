var express = require('express')
var app = express()
var path = require("path");
const PythonShell = require('python-shell');
const fs = require('fs');
const csvWriter = require("csv-write-stream");
var bodyParser = require('body-parser');
const writer = csvWriter({sendHeaders: false});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.set('port', (process.env.PORT || 8080))
app.use(express.static(__dirname + '/public'))

app.get('/', function (request, response) {
  response.sendFile(path.join(__dirname + '/public/index.html'));
})

app.listen(app.get('port'), function () {
  console.log("Node app is running at http://localhost:" + app.get('port'))
})

app.post('/trials', function (req, res) {
  console.log("trials post request received");
  let subjCode = req.body.subjCode;
  console.log("subjCode received is " + subjCode);
  PythonShell.defaultOptions = { args: [subjCode] };
  PythonShell.run('TYP_genTrials_v2.py', function (err, results) {
    // res.send(trials);
    if (err) throw err;
    console.log(results);
    res.send({success: results[0]});
  });
})
