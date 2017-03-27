URL Extraction Service
---------------------
This service is a REST API for extracting HTML content from a URL.  It uses
the PhantomJS headless browser to crawl a given URL, then applies the
Readability algorithm to strip user interface text and advertisements.

# Build

$ nvm use
$ npm install
$ npm run build

Now to run the compiled server (production):

$ node dist/server.js

You can run it using babel-node for development:

$ babel-node src/server.js
