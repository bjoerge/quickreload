# CSSRELOAD

## Usage

Add it as a dev dependency to your projects package.json
```json
  "cssreload": "git://github.com/bjoerge/cssreload#master"
```

Start up the monitor from the command line in the root directory you want to monitor:

    $ ./node_modules/.bin/cssmon 

Include cssreload.js in your web page, and connect to monitor:
```html
<script src='cssreload.js'></script>

<script>
cssreload.connect()
</script>

```