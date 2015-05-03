module.exports = function injectScript(res) {
  var HEAD = /<\/head\s*>/;
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

  var snippet = '<script src="/quickreload.js" async></script>';

  function inject() {
    buf = buf.replace(HEAD, snippet+'</head>');
    if (res.getHeader('content-length') > 0) {
      // If content-length is set we have the whole buffer already at hand
      res.setHeader('content-length', buf.length);
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