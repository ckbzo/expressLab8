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
    host: '52.10.115.55',
    key: fs.readFileSync('ssl/server.key'),
    cert: fs.readFileSync('ssl/server.crt')
};
app.use(bodyParser());
app.use('/', express.static('./html', {maxAge: 60*60*1000}));

http.createServer(app).listen(80);
https.createServer(options, app).listen(443);

  // app.get('/', function (req, res) {
  //   res.send("Get Index, nigga");
  // });
  
app.get('/getcity', function (req, res) {
	console.log("In getcity route");
	// res.json([{city:"Price"},{city:"Provo"}]);
	fs.readFile(ROOT_DIR+'/cities.dat.txt', function (err,data){
		if(err) throw err;
		//console.log("In get city function");
		var cities = data.toString().split('\n');
		var urlObj = url.parse(req.url, true, false);
		var myRegEx = RegExp('^'+urlObj.query['q']);
		var jsonresult = []
		for(var i = 0; i < cities.length; i++){
			var result = cities[i].search(myRegEx);
			if(result != -1){
				//console.log(cities[i]);
				jsonresult.push({city: cities[i]});
			}
		}
		//console.log(JSON.stringify(jsonresult));
		res.writeHead(200);
		res.end(JSON.stringify(jsonresult));
	});
});
app.get('/comment', function (req, res) {
    console.log("In comment route");
    
	// Add a CRUD route for Read  on GET
	// console.log("In GET"); 
	// Read all of the database entries and return them in a JSON array
	
	MongoClient.connect("mongodb://localhost/weather", function(err, db) {
		if(err) throw err;
		db.collection("comment", function(err, comments){
			if(err) throw err;
			comments.find(function(err, items){
		    	items.toArray(function(err, itemArr){
			    	console.log("Document Array: ");
			    	console.log(itemArr);
			    	res.json(itemArr);
			  //   	res.writeHead(200);
					// res.end(JSON.stringify(itemArr));
			    });
		 	});
		});
	});
  });
// app.post('/comment', auth, function (req, res) {
//     console.log("In POST comment route");
//     console.log(req.user);
//     console.log("Remote User");
//     console.log(req.remoteUser);
//     res.status(200);
//     res.end();
//   });
  
  app.post('/comment', auth, function (req, res) {
    console.log("In POST comment route");

    MongoClient.connect("mongodb://localhost/weather", function(err, db) {
		if(err) throw err;
		db.collection('comment').insert(req.body,function(err, records) {
			//console.log("Record added as "+records[0]._id);
			res.status(200);
			res.end("{ textStatus: \"Success\" }");
		});









 //    // console.log("POST comment route");
 //  		// First read the form data
	// var jsonData = "";
	// req.on('data', function (chunk) {
	// 	jsonData += chunk;
	// });
	// req.on('end', function () {
	// 	var reqObj = JSON.parse(jsonData);
	// 	console.log(reqObj);
	// 	console.log("Name: "+reqObj.Name);
	// 	console.log("Comment: "+reqObj.Comment);
	// 	res.writeHead(200);
	// 	res.end("");
	// 	// Now put it into the database
	// 	MongoClient.connect("mongodb://localhost/weather", function(err, db) {
	// 		if(err) throw err;
	// 		db.collection('comment').insert(reqObj,function(err, records) {
	// 		  console.log("Record added as "+records[0]._id);
	// 		});
	// 	});
		
	});


    // console.log(req.body);
    // res.status(200);
    // res.end();
  });