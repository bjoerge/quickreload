var path = require('path')
var browserify = require('browserify')
var envify = require('envify/custom')
var concat = require('concat-stream')

module.exports = function createClientScript (serverUrl, callback) {
  var b = browserify(path.join(__dirname, '..', '/client.js'))
    .transform(envify({
      DEBUG: process.env.DEBUG,
      SERVER_URL: serverUrl
    }))
    .bundle()

  b.on('error', callback)

  b.pipe(concat(function (buf) {
    callback(null, buf)
  }))
}
