#QuickReload

A tiny thing to make the browser reload css and javascript when files are changed on disk. Saves you ~ 1 second for every edit.

## Usage

    $ npm install -g quickreload

Start up the monitor from the command line in the root directory you want to monitor:

    $ quickreload 

Include `reloader.js` in your web page:
```html
<script src='//raw.github.com/bjoerge/quickreload/master/reloader.js'></script>
```
