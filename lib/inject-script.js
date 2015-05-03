function acceptsHTML(req) {
  var acceptHeader = req.headers["accept"];
  if (!acceptHeader) return false;
  return acceptHeader.indexOf("html") > -1;
}

var ignoreExtensions = ['.js', '.css', '.svg', '.ico', '.woff', '.png', '.jpg', '.jpeg']
var snippet = '<script src="/quickreload.js" async></script>';

function endsWith(str, ending) {
  return str.substring(str.length - ending.length) === ending;
}

function shouldIgnore(req) {
  var url = req.url;
  if (!url) return true;

  return ignoreExtensions.some(function (ext) {
    return endsWith(url, ext);
  });
}

module.exports = function injectScript(req, res) {

  if (!acceptsHTML(req) || shouldIgnore(req)) {
    return;
  }

  var HEAD = /(<head.*>)/i;
  var buf = "";
  var contentType;

  var write = res.write;
  var end = res.end;

  res.end = function(buf, enc) {
    if (buf) {
      this.write(buf, enc)
    }
    check(true);
    end.call(res);
  };

  res.write = function(chunk, encoding) {

    buf += chunk.toString();

    if (!res.headersSent) {
      return true;
    }
    check();
    return true;
  };

  function check(end) {
    if (!contentType) {
      contentType = (res.getHeader('content-type') || '').split(';')[0];
      if (contentType !== 'text/html') {
        restore();
        flush();
        return;
      }
    }
    if (end || gotTag(buf)) {
      inject();
      flush();
      restore();
    }
  }

  function inject() {
    buf = buf.replace(HEAD, function (match) {
      return match + snippet;
    })
    if (res.getHeader('content-length') > 0) {
      // If content-length is set we have the whole buffer already at hand
      res.setHeader('content-length', Buffer.byteLength(buf));
    }
  }

  function gotTag(buf) {
    return HEAD.test(buf);
  }

  function flush() {
    write.call(res, buf, 'utf-8')
  }

  function restore() {
    res.write = write;
    res.end = end;
  }
}