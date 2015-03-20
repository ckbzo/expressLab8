var express = require('express');
var https = require('https');
var http = require('http');
var fs = require('fs');
var url = require('url');
var app = express();
var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;
var ROOT_DIR = "./html";
var basicAuth = require('basic-auth-connect');
var auth = basicAuth(function(user, pass) {
    return((user ==='cs360')&&(pass === 'test'));
});
var options = {
    host: '52.11.58.98',
    key: fs.readFileSync('ssl/server.key'),
    cert: fs.readFileSync('ssl/server.crt')
};
app.use(bodyParser());
app.use('/', express.static('./html', {maxAge: 60*60*1000}));

http.createServer(app).listen(80);
https.createServer(options, app).listen(443);
app.get('/getcity', function (req, res) {
  console.log("In getcity route");
  fs.readFile(ROOT_DIR+'/cities.dat.txt', function (err,data){
    if(err) throw err;
    var cities = data.toString().split('\n');
    var urlObj = url.parse(req.url, true, false);
    var myRegEx = RegExp('^'+urlObj.query['q']);
    var jsonresult = []
    for(var i = 0; i < cities.length; i++){
      var result = cities[i].search(myRegEx);
      if(result != -1){
        jsonresult.push({city: cities[i]});
      }
    }
    res.writeHead(200);
    res.end(JSON.stringify(jsonresult));
  });
});
app.get('/comment', function (req, res) {
    console.log("In comment route");
  MongoClient.connect("mongodb://localhost/weather", function(err, db) {
    if(err) throw err;
    db.collection("comment", function(err, comments){
      if(err) throw err;
      comments.find(function(err, items){
          items.toArray(function(err, itemArr){
            console.log("Document Array: ");
            console.log(itemArr);
            res.json(itemArr);
          });
      });
    });
  });
  });
  app.post('/comment', auth, function (req, res) {
    console.log("In POST comment route");

    MongoClient.connect("mongodb://localhost/weather", function(err, db) {
    if(err) throw err;
    db.collection('comment').insert(req.body,function(err, records) {
      res.status(200);
      res.end("{ textStatus: \"Success\" }");
    });
    
  });


  });
