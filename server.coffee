exports.serve = (opts={host: undefined, port: 8081}) ->
  WebSocketServer = require('ws').Server
  wss = new WebSocketServer(opts)
  clients = []

  wss.on 'connection', (client) ->
    clients.push client
    console.log("Client connected, got #{clients.length} clients in total.")

    client.on 'close', ->
      index = clients.indexOf(client)

      clients.splice(index, 1) if index != -1

      console.log("Client disconnected. Got #{clients.length} left")

  wss.on 'error', (client) ->
    console.log("Error: ", client)

  console.log("Waiting for connections");

  (event)->
    console.log("Sending #{event} to #{clients.length} connected clients.")
    (try client.send(event)) for client in clients
