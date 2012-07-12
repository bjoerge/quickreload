reloadStylesheets = ->
  queryString = '?reload=' + new Date().getTime();
  $('link[rel="stylesheet"]').each ->
    @href = @href.replace(/\?.*|$/, queryString);

connect = (opts={}) ->
  # if user is running mozilla then use it's built-in WebSocket
  window.WebSocket ||= window.MozWebSocket

  connection = new WebSocket('ws://' + (opts.host || document.domain || 'localhost') + ':'+(opts.port || 8081))

  connection.onopen = ->
    console.log("Connected to watcher")

  connection.onerror = ->
    console.log("Unable to connect to watcher")

  connection.onmessage = (message) ->
    switch message
      when 'reload-css'
        reloadStylesheets() 
      when 'reload-js'
        window.location.reload()    

connect()