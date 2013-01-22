reloadStylesheets = ->
  queryString = '?reload=' + new Date().getTime()
  el.href = el.href.replace(/\?.*|$/, queryString) for el in document.querySelectorAll('link[rel="stylesheet"]')

connect = (opts={}) ->
  # if user is running mozilla then use it's built-in WebSocket
  WebSocket = window.WebSocket || window.MozWebSocket

  return unless WebSocket

  connection = new WebSocket('ws://' + (opts.host || document.domain || 'localhost') + ':'+(opts.port || 8081))

  connection.onopen = ->
    console.log("Connected to watcher")

  connection.onerror = ->
    console.log("Unable to connect to watcher")

  connection.onmessage = (message) ->
    switch message.data
      when 'reload-css'
        reloadStylesheets() 
      when 'reload-js'
        window.location.reload()    
      when 'reload'
        window.location.reload()    

connect()
