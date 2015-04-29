var debug = require("debug")("quickreload");

module.exports = function channel(webSocketServer) {
  var clients = [];

  webSocketServer.on('connection', function (client) {
    var id = clients.push(client);
    debug("A client connected. Got %s connected clients.", clients.length);
    client.on('close', function() {
      clients.splice(id - 1, 1);
    });
  });

  webSocketServer.on('error', function (client) {
    debug("Client error: ", client)
  });

  return function send(command) {
    debug("Sending '%s' to %s connected clients.", command, clients.length);
    clients.forEach(function (client, i) {
      try {
        client.send(command)
      }
      catch (e) {
        debug("Error sending %s to client %s", command, i)
      }
    });
  }
};