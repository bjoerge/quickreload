// browser side 

require('debug').disable();
require('debug').enable(process.env.DEBUG);

var debug = require("debug")('quickreload');

var WebSocket = window.WebSocket;

var port = process.env.QUICKRELOAD_PORT || 7888;

if (!WebSocket) {
  debug('No web sockets support.');
}
else {
  connect();
}

var reconnectTimer = null;
var reconnectAttempts = 0;

function reconnect() {
  reconnectTimer = null;
  connect();
}
function reloadStyleSheets() {
  var killcache = '__quickreload=' + new Date().getTime();
  var stylesheets = Array.prototype.slice.call(document.querySelectorAll('link[rel="stylesheet"]'));
  stylesheets.forEach(function (el) {
    var href = el.href.replace(/(&|\?)__quickreload\=\d+/, '');
    el.href = '';
    el.href = href + (href.indexOf("?") == -1 ? '?' : '&') + killcache;
  });
}

function connect() {
  var connection = new WebSocket('ws://' + (document.location.hostname || 'localhost') + ':' + port);

  connection.onopen = function() {
    reconnectAttempts = 0;
    return debug("Connected to watcher");
  };

  connection.onerror = function() {
  };

  connection.onclose = function() {
    var delay = (reconnectAttempts == 0 ? 100 : 0) + reconnectAttempts*500;
    reconnectAttempts++;
    debug("Connection closed. Reconnecting in %dms", delay);
    if (!reconnectTimer) {
      reconnectTimer = setTimeout(reconnect, delay);
    }
  };

  return connection.onmessage = function(message) {
    switch (message.data) {
      case 'reload-css':
        debug('CSS changes detected. Reloading');
        return reloadStyleSheets();
      case 'reload-js':
        debug('JavaScript changes detected. Reloading');
        return window.location.reload();
      case 'reload-html':
        debug('HTML changes detected. Reloading');
        return window.location.reload();
    }
  };
}