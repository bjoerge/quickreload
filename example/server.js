var path = require("path");
var fs = require("fs");
var express = require("express");

var app = express();

app.use(require("..")());

app.get("/", function (req, res) {
  fs.createReadStream('./index.html') .pipe(res.status(200).type('text/html'));
});

app.get("/style.css", function (req, res) {
  fs.createReadStream('./style.css').pipe(res.status(200).type('text/css'));
});

app.get("/browser.js", function (req, res) {
  fs.createReadStream('./browser.js').pipe(res.status(200).type('application/javascript'));
});

app.listen(3000, function(err) {
  if (err) {
    throw err;
  }
  console.log("Listening on http://localhost:3000")
});