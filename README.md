# quickreload

A tiny thing to make the browser reload when files are changed on disk.

Includes a command line tool and an express middleware.

Features:

- Zero configuration. Just add quickreload as an express middleware, or run `quickreload` from the command line
- Reloads css without doing a full page refresh
- Reconnects if the backend (websockets server) goes down

## Express middleware

```js
if (process.env.NODE_ENV === 'development') {
  app.use(require("quickreload")({
    // options...
  ));
}
```

Valid options are:

- `inject` Will inject a snippet into all reponses with content-type set to text/html that loads the browser side part of quickreload. Default is true.

If using `inject: false`, the following snippet must be included in the source code of pages that should reload on changes:

```html
<script src="/quickreload.js" async></script>
```

## Command line

Install the command system wide using `npm install quickreload -g`

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
                           port if not given.
```
