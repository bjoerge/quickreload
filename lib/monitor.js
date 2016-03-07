var watch = require('watch')
var path = require('path')
var minimatch = require('minimatch')
var EventEmitter = require('events').EventEmitter
var xtend = require('xtend')
var debug = require('debug')('quickreload')

module.exports = createMonitor

var DEFAULTS = module.exports.DEFAULTS = {
  // css extensions (will be reloaded w/o page reload)
  css: 'css,sass,scss,less,styl',

  // extensions to treat as javascript (will reload page)
  js: 'js,jsx,json,coffee',

  // extensions to treat as html (will reload page)
  html: 'html,jade',

  // Root directory
  root: process.cwd(),

  // Polling interval
  interval: 100,

  // glob string or directory names to ignore
  ignore: ['node_modules']
}

function createMonitor (options, callback) {
  debug('Create monitor')
  options = xtend(DEFAULTS, options || {})

  var rootDir = path.resolve(options.root)

  var emitter = new EventEmitter()

  function hasExt (extensions, file) {
    var globstr = extensions.indexOf(',') > -1 ? '*.{' + extensions + '}' : '*.' + extensions
    return minimatch(path.basename(file), globstr)
  }

  function handleChange (file) {
    ['html', 'js', 'css'].forEach(function (type) {
      if (hasExt(options[type], file)) {
        emitter.emit('change', {type: type, file: file})
        return true
      }
    })
  }

  var allExts = '*{' + [options.css, options.js, options.html].join(',') + '}'

  function filter (file, stat) {
    if (!stat) {
      return
    }
    if (stat.isDirectory()) {
      if (options.ignore.length === 0) {
        return true
      }
      var basename = path.basename(file)
      return !options.ignore.some(function (ignore) {
        return basename === ignore || minimatch(file, ignore)
      })
    }
    return minimatch(path.basename(file), allExts)
  }

  var monitorOptions = {
    ignoreUnreadableDir: true,
    ignoreDotFiles: true,
    interval: options.interval,
    filter: filter
  }

  watch.createMonitor(rootDir, monitorOptions, function (monitor) {
    monitor.on('created', handleChange)
    monitor.on('changed', handleChange)
    monitor.on('removed', handleChange)

    emitter.monitor = monitor
    if (callback) {
      debug('Monitor created')
      callback(null, emitter)
    }

    debug('Watching %d files in %s', Object.keys(monitor.files).length, rootDir)

    Object.keys(monitor.files).forEach(function (file) {
      debug('   %s', file)
    })
  })
}
