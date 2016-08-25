var memoize = require('./lib/async-memoize')
var createMonitor = require('./lib/monitor')
var injectScript = require('./lib/inject-script')
var debug = require('debug')('quickreload')
var SseChannel = require('sse-channel')

var createClientScript = memoize(require('./lib/createClientScript'))

// Set up an interval that broadcasts server date every second
module.exports = function quickreload (options) {
  options = options || {}

  var channel = new SseChannel({jsonEncode: true})

  createMonitor(options, function (err, monitor) {
    if (err) {
      throw err
    }
    monitor.on('change', function (ev) {
      channel.send({
        event: 'change',
        data: {type: ev.type, file: ev.file}
      })
    })
  })

  const clientScriptOpts = {polyfill: options.polyfill}
  // Just to warm the client script cache
  createClientScript(clientScriptOpts, function noop () {})

  return function (req, res, next) {
    if (req.path === '/quickreload.js') {
      debug('Serving /quickreload.js')
      res.type('application/javascript')
      createClientScript(clientScriptOpts, function (err, script) {
        if (err) {
          res.writeHead(500, {'Content-Type': 'text/plain'})
          res.send('Internal server error: ' + err.message)
          return
        }
        res.writeHead(200, {'Content-Type': 'text/javascript'})
        res.end(script)
      })

      return
    }
    if (req.path === '/__quickreload_events') {
      debug('Adding client')
      channel.addClient(req, res)
      return
    }
    if (options.inject !== false) {
      debug('Injecting script')
      injectScript(req, res)
    }
    next()
  }
}
