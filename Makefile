SRC = client.coffee
DST = "."

REPORTER = dot

all: reloader.js reloader.min.js

reloader.js:
	@./node_modules/.bin/coffee --compile -o . $(SRC)
	@mv client.js reloader.js

reloader.min.js: reloader.js
	@uglifyjs --no-mangle $(DST)/$< > $(DST)/$@
	@node -e "console.log('%sKB %s', (Math.round(require('fs').statSync('$(DST)/$@').size/1024)), '$(DST)/$@')"

clean:
	rm -f reloader{,.min}.js

.PHONY: clean