var P = require("bluebird");
var server = require("./server");
var getPort = P.promisify(require("getport"));
var browserify = require("browserify");
var debounce = require("debounce");
var envify = require("envify/custom");
var createMonitor = P.promisify(require("./monitor"));

module.exports = function(options) {
  options = options || {};

  var gotPort = getPort(50000, 50100);

  var madeServer = gotPort.then(function(port) {
    return server({port: port});
  })
  .then(function(send) {
    return debounce(send, 50, true);
  });

  var madeMonitor =  createMonitor(options);

  P.join(madeMonitor, madeServer).spread(function(monitor, send) {
    monitor.on('change', function(ev) {
      send('reload-'+ev.type);
    });
  });

  return function(req, res, next) {

    if (req.path !== '/quickreload.js') {
      return next();
    }

    res.type("application/javascript");
    gotPort.then(function(port) {
        browserify(__dirname+"/client.js")
          .transform(envify({DEBUG: process.env.DEBUG, QUICKRELOAD_PORT: port }))
          .bundle()
          .pipe(res)
          .on('end', next);
    });

  }
};