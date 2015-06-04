var http = require("http");
var fs = require("fs");
var express = require("express");
var errorHandler = require('dev-error-handler');

var app = express();

var server = http.createServer(app);

app.use(require("..")({
  server: server,
  inject: true
}));

app.get("/", function (req, res) {
  fs.createReadStream(__dirname+'/index.html').pipe(res.status(200).type('text/html'));
});

app.get("/no-status", function (req, res) {
  res.send('ok');
});

app.get("/slow", function (req, res) {
  res.status(200).type('text/html');

  var chunks = [
    '<html>',
    '<head>',
    '<title>Slow page</title>',
    '</he',
    'ad>',
    '<body>',
    'This is a slow page',
    '</body>',
    '</html>'
  ];


  chunks.forEach(function(chunk, i) {
    setTimeout(writeChunk(chunk), i*500);
  });

  setTimeout(function() {
    res.end();
  }, chunks.length * 500)

  function writeChunk(chunk) {
    return function() {
      console.log("Writing chunk", chunk);
      res.write(chunk);
    }
  }

});

app.get("/error", function (req, res, next) {
  next(new Error("Uh oh"));
});

app.get("/style.css", function (req, res) {
  fs.createReadStream(__dirname+'/style.css').pipe(res.status(200).type('text/css'));
});

app.get("/browser.js", function (req, res) {
  fs.createReadStream(__dirname+'/browser.js').pipe(res.status(200).type('application/javascript'));
});

app.use(errorHandler)

server.listen(3000, function(err) {
  if (err) {
    throw err;
  }
  console.log("Listening on http://localhost:3000")
});