var WebSocketServer = require('ws').Server;
var http = require('http');
var channel = require("./channel");
var browserify = require("browserify");
var debounce = require("debounce");
var getPort = require("getport");
var envify = require("envify/custom");
var createMonitor = require("./monitor");

function memoize(fn) {
  var state = 'accept';
  var args = null;
  var queue = [];
  return function (callback) {
    if (state == 'done') {
      return process.nextTick(function () {
        callback.apply(null, args);
      })
    }
    queue.push(callback);
    if (state == 'accept') {
      state = 'waiting';
      fn(function (err) {
        state = err ? 'accept' : 'done';
        args = arguments;
        var cb;
        while (cb = queue.shift()) {
          cb.apply(null, args);
        }
      });
    }
  }
}

module.exports = function quickreload(options) {
  options = options || {};

  var getOrCreateServer = memoize(function (callback) {
    if (options.server) {
      options.server.once('listening', function () {
        return callback(null, options.server);
      })
    }
    var server = http.createServer();

    var port = options.port || 50000;

    getPort(port, port + 100, function (err, port) {
      if (err) {
        return callback(err);
      }
      server.listen(port, function (err) {
        callback(err, server);
      })
    });
  });

  getOrCreateServer(function (err, server) {
    if (err) {
      throw err;
    }
    var wss = new WebSocketServer({server: server});
    var send = debounce(channel(wss), 50, true);

    createMonitor(options, function (err, monitor) {
      monitor.on('change', function (ev) {
        send('reload-' + ev.type);
      });
    });
  });

  var getClientScript = memoize(function (callback) {
    getOrCreateServer(function (err, server) {
      var port = server.address().port;
      var b = browserify(__dirname + "/client.js")
        .transform(envify({DEBUG: process.env.DEBUG, QUICKRELOAD_PORT: port}))
        .bundle();
      var buf = '';
      b.on('data', function (chunk) {
        buf += chunk;
      });
      b.on('error', callback)
      b.on('end', function () {
        callback(null, buf);
      });
    })
  });

  // Just to warm the client script cache
  getClientScript(function () {
  });

  return function (req, res, next) {
    if (req.path == '/quickreload.js') {
      return getClientScript(function (err, script) {
        if (err) {
          return next(err);
        }
        res.type("application/javascript").send(script)
      })
    }
    if (options.inject) {
      injectScript(res);
    }
    next();
  };

  function injectScript(res) {
    var HEAD = /<\/head\s*>/;
    var buf = "";
    var contentType;

    var write = res.write;
    var end = res.end;

    res.end = function(buf, enc) {
      if (buf) {
        this.write(buf, enc)
      }
      check();
      end.call(res);
    };

    res.write = function(chunk, encoding) {

      buf += chunk.toString();

      if (!res.headersSent) {
        return true;
      }
      check();
      return true;
    };

    function check() {
      if (!contentType) {
        contentType = (res.getHeader('content-type') || '').split(';')[0];
        if (contentType !== 'text/html') {
          restore();
          flush();
          return;
        }
      }
      if (gotTag(buf)) {
        inject();
        flush();
        restore();
      }
    }

    function inject() {
      buf = buf.replace(HEAD, '<script src="/quickreload.js" async></script></head>')
    }

    function gotTag(buf) {
      return HEAD.test(buf);
    }

    function flush() {
      write.call(res, buf, 'utf-8')
    }

    function restore() {
      res.write = write;
      res.end = end;
    }
  }
};