(function (root) {

  function reloadStylesheets() {
    var queryString = '?reload=' + new Date().getTime();
    $('link[rel="stylesheet"]').each(function () {
      this.href = this.href.replace(/\?.*|$/, queryString);
    });
  }

  var cssReload = {
    connect: function () {
      // if user is running mozilla then use it's built-in WebSocket
      window.WebSocket = window.WebSocket || window.MozWebSocket

      var connection = new WebSocket('ws://parlor.dev:1337')

      connection.onopen = function () {
        console.log("Connected to css monitor");
      };

      connection.onerror = function () {
        console.log("Unable to connect to css monitor. Check that it started from root directory with (./cssmon.js)")
      };

      connection.onmessage = function (message) {
        if (message.data == 'reload') reloadStylesheets()
      };
    }
  };

  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = cssReload
    }
    exports.cssreload = cssReload;
  } else {
    root['cssreload'] = cssReload;
  }

})(window);