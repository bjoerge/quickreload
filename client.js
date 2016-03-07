// browser side
var debug = require('debug')('quickreload')
var EventSource = require('eventsource')

var RELOADERS = {
  css: reloadStyleSheets,
  js: reloadJavaScript,
  html: reloadHtml
}

function reloadStyleSheets () {
  var killcache = '__quickreload=' + new Date().getTime()
  var stylesheets = Array.prototype.slice.call(document.querySelectorAll('link[rel="stylesheet"]'))
  stylesheets.forEach(function (el) {
    var href = el.href.replace(/(&|\?)__quickreload\=\d+/, '')
    el.href = ''
    el.href = href + (href.indexOf('?') === -1 ? '?' : '&') + killcache
  })
}

function reloadJavaScript () {
  window.location.reload()
}

function reloadHtml () {
  window.location.reload()
}

var serverUrl = process.env.SERVER_URL || ''

var events = new EventSource(serverUrl + '/__quickreload_events')
events.addEventListener('change', function (event) {
  var change = JSON.parse(event.data)

  debug('Changed: %s', change.file)

  if (RELOADERS.hasOwnProperty(change.type)) {
    RELOADERS[change.type]()
  } else {
    console.log('Don\'t know how what do do when files of type "%s" changes (file: %s)', change.type, change.file)
  }
})
