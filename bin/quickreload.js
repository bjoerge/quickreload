#!/usr/bin/env node

var browserify = require("browserify");
var envify = require("envify/custom");
var debug = require("debug")("quickreload");
var fs = require("fs");
var getPort = require("getPort");
var xtend = require("xtend");

var createMonitor = require("../monitor");
var createServer = require("../server");

var argv = require('minimist')(process.argv.slice(2), {
  alias: {
    i: 'ignore',
    p: 'port'
  },
  default: require("../monitor").DEFAULTS
});


function showHelp() {
  process.stdout.write(fs.readFileSync(__dirname+"/usage.txt"));
}

if (argv.help) {
  showHelp();
  process.exit(0)
}

function createHttpServer(wsPort) {
  var http = require('http');
  // Configure our HTTP server to respond with Hello World to all requests.
  return http.createServer(function (request, response) {
    response.writeHead(200, {"Content-Type": "text/javascript"});
    browserify(require.resolve("../client.js"))
      .transform(envify({ QUICKRELOAD_PORT: wsPort }))
      .bundle()
      .pipe(response);
  });
}


function getWSPort(cb) {
  if (argv.port) {
    return process.nextTick(cb.bind(null, null, argv.port));
  }
  getPort(50000, 50100, cb);
}

getWSPort(function(err, wsPort) {
  var httpServer = createHttpServer(wsPort);

  var send = createServer({
    server: httpServer
  });

  var monitorOptions = xtend(argv, {
    ignore: [].concat(argv.ignore),
    root: argv._[0] || process.cwd()
  });

  createMonitor(monitorOptions, function(err, monitor) {
    monitor.on('change', function(ev) {
      send('reload-'+ev.type)
    });
  });

  httpServer.listen(wsPort, function(err) {
    if (err) {
      throw err;
    }
    console.log('Quickreload is accepting connections on ws://localhost:%s', wsPort);
    console.log();
    console.log('Include the following snippet in your html file(s): ');
    console.log();
    console.log('   <script src="http://localhost:%s"></script>', wsPort);
    console.log();
  });
});