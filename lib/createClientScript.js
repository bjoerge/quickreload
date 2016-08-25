var path = require('path')
var browserify = require('browserify')
var envify = require('envify/custom')
var concat = require('concat-stream')

module.exports = function createClientScript (options, callback) {
  options = options || {}
  var entries = [
    options.polyfill !== false && require.resolve('eventsource-polyfill'),
    path.join(__dirname, '..', '/client.js')
  ].filter(Boolean)

  var b = browserify(entries)
    .transform(envify({
      DEBUG: process.env.DEBUG
    }))
    .plugin('bundle-minify')
    .bundle()

  b.on('error', callback)

  b.pipe(concat(function (buf) {
    callback(null, buf)
  }))
}
