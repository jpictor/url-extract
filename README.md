# URL Extraction Service
This service is a REST API for extracting HTML content from a URL.  It uses
the PhantomJS headless browser to crawl a given URL, then applies the
Readability algorithm to strip user interface text and advertisements.

## Configuration
This service is configured using environment variables.  The default values
are put in the .env file.
* MEMCACHED_SERVER: Host and port of memcached server in the format **host:port**.

## Build
```bash
$ nvm use
$ npm install
$ npm run build
```

Now to run the compiled server (production):
```bash
$ node dist/server.js
```

You can run it using babel-node for development:
```bash
$ babel-node src/server.js
```
