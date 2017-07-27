var express = require('express')
var app = express()
var path = require("path");
const PythonShell = require('python-shell');
const fs = require('fs');
const _ = require('lodash');
const csvWriter = require("csv-write-stream");
var bodyParser = require('body-parser');
const writer = csvWriter({sendHeaders: false});
const csv=require('csvtojson')

let subjCode = 'null_subjCode';

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
  subjCode = req.body.subjCode;
  console.log("subjCode received is " + subjCode);
  PythonShell.defaultOptions = { args: [subjCode] };
  PythonShell.run('TYP_genTrials_v2.py', function (err, results) {
    // res.send(trials);
    if (err) throw err;
    console.log(results);
    

    let csvFilePath = 'trials/trials_' + subjCode + '.csv';
    let trials = [];
    csv()
    .fromFile(csvFilePath)
    .on('json',(jsonObj)=>{
      // combine csv header row and csv line to a json object
      // jsonObj.a ==> 1 or 4
      trials.push(jsonObj);
    })
    .on('done',(error)=>{
      if (error) {
        res.send({success: false});
        throw error;
      }
      res.send({success: results[0], trials: trials});
      console.log('finished parsing csv')
    })
    
  });
})

app.post('/data', function (req, res) {
  console.log('data post request received');
  let data = req.body;
  let dataString = _.map(data, (value) => {
    return value + '';
  }).join('\t')+'\n';
  let path = 'data/'+subjCode+'_test.txt';
  if (!fs.existsSync(path)) 
    fs.openSync(path, 'a');
  else
    console.log("file exists");
  fs.appendFile(path, dataString, function (err) {
      if (err) {
        res.send({success: false});
        throw err;
      }
      res.send({success: true});
    } )
})

// {
// 	"subjCode": "sloth",
// 	"seed": "seed",
// 	"whichYes": "whichYes",
// 	"data": "myData",
// 	"initials": "IJ",
// 	"cueCategory": "som_category",
// 	"cueType": "slothscue",
// 	"cueAnimate": "some.wav",
// 	"picCategory": "cat_pic",
// 	"picType": "wav",
// 	"picAnimate": "NoAnimate",
// 	"picFile": "somethingpicFile",
// 	"soa" : "soa",
// 	"isMath": "isMathch",
// 	"sameAnimacy": "notsameAnimacy",
// 	"block": "BLock B",
// 	"whichPart": "that part",
// 	"curTrialIndex": "0 curr trial",
// 	"expTimer" : "100 exp tiemr",
// 	"isRight": "not right",
// 	"rt": "1000ms"
// }	
