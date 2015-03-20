var express = require('express');
var bodyParser = require('body-parser');
var basicAuth = require('basic-auth-connect');
var https = require('https');
var http = require('http');
var fs = require('fs');
var url = require('url');

var MongoClient = require('mongodb').MongoClient;

var ROOT_DIR = "./html";

var auth = basicAuth(function(user, pass) {
  return ((user === 'cs360') && (pass === 'test'));
});

var app = express();

var options = {
  host: '127.0.0.1',
  key: fs.readFileSync('ssl/server.key'),
  cert: fs.readFileSync('ssl/server.crt')
};

app.use(bodyParser());
app.use('/', express.static(ROOT_DIR, {maxAge: 60*60*1000}));

http.createServer(app).listen(80);
https.createServer(options, app).listen(443);

app.get('/getcity', function(req, res) {
  console.log("In getcity route");
  var urlObj = url.parse(req.url, true, false);
    
  fs.readFile(ROOT_DIR + "/cities.dat.txt", function(err, data) {
    if(err) {
      console.log("Failed to get file: cities.data.txt");

      res.writeHead(500);
      res.end(JSON.stringify(err));

      return;
    }
    var cities = new Array();
    var cityList = data.toString().split('\n');
    for(var i in cityList) {
      var city = cityList[i];
      if(city != "") {
        if(urlObj.query.q != null && city.toLowerCase().indexOf(urlObj.query.q.toLowerCase()) != 0) {
          continue;
        }

        cities.push({ city: city });
      }
    }

    res.writeHead(200);
    res.end(JSON.stringify(cities));
  });
});

app.get('/comment', function(req, res) {
  console.log("In comment route");

  MongoClient.connect("mongodb://localhost/weather", function(err, db) {
    if(err) {
      console.log("Failed to connect to the weather database");

      res.writeHead(500);
      res.end(JSON.stringify(err));

      return;
    }

    db.collection("comments", function(err, comments) {
      if(err) {
        console.log("Failed to get comments collection from weather database");

        res.writeHead(500);
        res.end(JSON.stringify(err));

        return;
      }
      comments.find(function(err, items) {
        if(err) {
          console.log("Failed to get comments from the comments collection in the weather database");

          res.writeHead(500);
          res.end(JSON.stringify(err));

          return;
        }

        items.toArray(function(err, itemArr) {
          if(err) {
            console.log("Failed to convert the list of comments to an array");
                
            res.writeHead(500);
            res.end(JSON.stringify(err));

            return;
          }

          console.log("Document Array: ");
          console.log(itemArr);

          res.json(itemArr);
        });
      });
    });
  });
});

app.post('/comment', auth, function(req, res) {
  MongoClient.connect("mongodb://localhost/weather", function(err, db) {
    if(err) {
      console.log("Failed to connect to the weather database");
      throw err;
    }

    db.collection('comments').insert(req.body, function(err, records) {
      if(err) {
        console.log("Failed to add comment to the weather database");
        throw err;
      }
      res.status(200);
      res.end("{ textStatus: \"Success\" }");
    });
  });
});
