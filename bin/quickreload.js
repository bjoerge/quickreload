#!/usr/bin/env node

var debug = require('debug')('quickreload')
var fs = require('fs')
var path = require('path')
var xtend = require('xtend')
var http = require('http')
var memoize = require('../lib/async-memoize')
var createClientScript = memoize(require('../lib/createClientScript'))

var SseChannel = require('sse-channel')
var createMonitor = require('../lib/monitor')

var argv = require('minimist')(process.argv.slice(2), {
  alias: {
    i: 'ignore',
    p: 'port'
  },
  default: createMonitor.DEFAULTS
})

function showHelp () {
  process.stdout.write(fs.readFileSync(path.join(__dirname, '/usage.txt')))
}

if (argv.help) {
  showHelp()
  process.exit(0)
}

function createHttpServer (port, callback) {
  var server = http.createServer()
  server.listen(port, function (err) {
    if (err) {
      callback(err)
      return
    }
    callback(null, server)
  })
}

var monitorOptions = xtend(argv, {
  ignore: [].concat(argv.ignore),
  root: argv._[0] || process.cwd()
})

createHttpServer(argv.port || 0, function (err, httpServer) {
  if (err) {
    throw err
  }
  var address = httpServer.address()

  var serverUrl = 'http://localhost:' + address.port

  console.log('Quickreload is running on %s', serverUrl)
  console.log()
  console.log('Include the following snippet in your html file(s): ')
  console.log()
  console.log('   <script src="%s"></script>', serverUrl)
  console.log()

  var channel = new SseChannel({
    jsonEncode: true,
    cors: {
      origins: ['*'],
      headers: ['cache-control']
    }
  })

  createMonitor(monitorOptions, function (err, monitor) {
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

  httpServer.on('request', function requestListener (req, res) {
    debug('handling request to %s', req.url)
    if (req.url === '/__quickreload_events') {
      channel.addClient(req, res)
      return
    }
    createClientScript(serverUrl, function (err, script) {
      if (err) {
        res.writeHead(500, {'Content-Type': 'text/plain'})
        res.send('Internal server error: ' + err.message)
        return
      }
      res.writeHead(200, {'Content-Type': 'text/javascript'})
      res.end(script)
    })
  })
})
