// Generated by CoffeeScript 1.4.0
(function() {
  var connect, reloadStylesheets;

  reloadStylesheets = function() {
    var el, queryString, _i, _len, _ref, _results;
    queryString = '?reload=' + new Date().getTime();
    _ref = document.querySelectorAll('link[rel="stylesheet"]');
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      el = _ref[_i];
      _results.push(el.href = el.href.replace(/\?.*|$/, queryString));
    }
    return _results;
  };

  connect = function(opts) {
    var WebSocket, connection;
    if (opts == null) {
      opts = {};
    }
    WebSocket = window.WebSocket || window.MozWebSocket;
    if (!WebSocket) {
      return;
    }
    connection = new WebSocket('ws://' + (opts.host || document.domain || 'localhost') + ':' + (opts.port || 8081));
    connection.onopen = function() {
      return console.log("Connected to watcher");
    };
    connection.onerror = function() {
      return console.log("Unable to connect to watcher");
    };
    return connection.onmessage = function(message) {
      switch (message.data) {
        case 'reload-css':
          return reloadStylesheets();
        case 'reload-js':
          return window.location.reload();
      }
    };
  };

  connect();

}).call(this);
