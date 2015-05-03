#!/usr/bin/env node

var browserify = require("browserify");
var envify = require("envify/custom");
var debug = require("debug")("quickreload");
var fs = require("fs");
var xtend = require("xtend");
var http = require('http');
var WebSocketServer = require('ws').Server;

var createMonitor = require("../lib/monitor");
var createChannel = require("../lib/channel");

var argv = require('minimist')(process.argv.slice(2), {
  alias: {
    i: 'ignore',
    p: 'port'
  },
  default: createMonitor.DEFAULTS
});

function showHelp() {
  process.stdout.write(fs.readFileSync(__dirname + "/usage.txt"));
}

if (argv.help) {
  showHelp();
  process.exit(0)
}

function createHttpServer(port, callback) {
  var server = http.createServer();
  server.listen(port, function(err) {
    if (err) {
      return callback(err)
    }
    var port = server.address().port;
    server.on('request', function requestListener(request, response) {
      response.writeHead(200, {"Content-Type": "text/javascript"});
      // Todo: cache client script
      browserify(require.resolve("../client.js"))
        .transform(envify({QUICKRELOAD_PORT: port}))
        .bundle()
        .pipe(response);
    });
    callback(null, server)
  });
}

var monitorOptions = xtend(argv, {
  ignore: [].concat(argv.ignore),
  root: argv._[0] || process.cwd()
});


createHttpServer(argv.port || 0, function(err, httpServer) {

  var address = httpServer.address();

  console.log('Quickreload is accepting connections on ws://%s:%s', address.address, address.port);
  console.log();
  console.log('Include the following snippet in your html file(s): ');
  console.log();
  console.log('   <script src="http://localhost:%s"></script>', address.port);
  console.log();

  var wsServer = new WebSocketServer({server: httpServer});

  var send = createChannel(wsServer);

  createMonitor(monitorOptions, function (err, monitor) {
    monitor.on('change', function (ev) {
      send('reload-' + ev.type)
    });
  });

});