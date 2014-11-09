# quickreload

A tiny thing to make the browser reload css and javascript when files are changed on disk.

Provides a command line tool and a middleware for express.

## Command line

```
Usage: quickreload [options] [watchdir]

  Will default to current working directory if watchdir is omitted.

  Options:

    --css <extensions...>  Comma separated list of extensions to treat as css
                           files. The client will reload all tags matching 
                           link[rel=stylesheet] when files with any of these
                           extensions are changed.
                           Default: css,sass,scss,less,styl

     --js <extensions...>  Comma separated list of extensions to treat as js
                           files. The client will do a full page reload when
                           files with any of these extensions are changed.
                           Default: js,jsx,coffee,json

    --html <extensions...> Comma separated list of extensions to treat as html 
                           files. The client will do a full page reload when
                           files with any of these extensions are changed.
                           Default: html

--ignore, -i <dir|globstr> A directory name or glob string that, if a directory
                           matches it will, it will not be  watched for 
                           changes.
                           Default: node_modules

         --port, -p <port> Port to listen to. Will assign a random available
                           port by default.
```

## Express middleware

```js
var quickreload = require("quickreload");

// ...

app.use(quickreload());

```

Then include the following script tag on pages that should respond to file changes:

```html
<script src="/quickreload.js" async></script>
```