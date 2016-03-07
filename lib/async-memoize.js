// Assumes function will always be called with same args
module.exports = function memoize (fn) {
  var state = 'accept'
  var callbackArgs = null
  var queue = []
  return function () {
    var args = Array.prototype.slice.call(arguments)
    var callback = args[args.length - 1]
    if (typeof callback !== 'function') {
      throw new Error('Expected last argument passed to memoized function to be a callback function')
    }
    if (state === 'done') {
      return process.nextTick(function () {
        callback.apply(null, callbackArgs)
      })
    }
    queue.push(callback)
    if (state === 'accept') {
      state = 'waiting'
      fn.apply(null, args.slice(0, -1).concat(function (err) {
        state = err ? 'accept' : 'done'
        callbackArgs = arguments
        var cb
        while ((cb = queue.shift())) {
          cb.apply(null, callbackArgs)
        }
      }))
    }
  }
}
