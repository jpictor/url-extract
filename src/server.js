import express from 'express'
import bodyParser from 'body-parser'
import { get } from 'lodash'
import { oembedApiDoc } from './oembed'
import { checkUrlApiDoc } from './check_url'
import { extractUrlApiDoc } from './html_extract'
import { cardApiDoc } from './url_card'

async function oembedApi (req, res) {
  console.log(`GET: /api/oembed url=${req.query.url}`)
  let doc = await oembedApiDoc(req.query.url, req.query.cache)
  if (doc) {
    res.json(doc)
  } else {
    res.status(404).json({error: 'no embed response'})
  }
}

async function checkUrlApi (req, res) {
  console.log(`GET: /api/url_info url=${req.query.url}`)
  let doc = await checkUrlApiDoc(req.query.url, req.query.cache)
  res.json(doc)
}

async function extractUrlApi (req, res) {
  console.log(`GET: /api/extract_html url=${req.query.url}`)
  let doc = await extractUrlApiDoc(req.query.url, req.query.cache)
  res.json(doc)
}

async function allApi (req, res) {
  console.log(`GET: /api/all url=${req.query.url} cache=${req.query.cache}`)
  let checkUrlDoc = await checkUrlApiDoc(req.query.url, req.query.cache)
  let resolvedUrl = get(checkUrlDoc, 'resolved_url', req.query.url)
  let [ oembedDoc, htmlExtractDoc ] = await Promise.all([
    oembedApiDoc(resolvedUrl, req.query.cache),
    extractUrlApiDoc(req.query.url, req.query.cache)
  ])
  let allDoc = {
    oembed: oembedDoc,
    url_info: checkUrlDoc,
    html_extract: htmlExtractDoc
  }
  allDoc.card = cardApiDoc(allDoc)
  res.json(allDoc)
}

function errorChecking (routeHandler) {
  return async function (req, res, next) {
    if (!req.query.url) {
      res.status(400).json({error: 'missing parameter: url'})
      return
    }
    if (req.query.cache) {
      if (req.query.cache === 'false') {
        req.query.cache = false
      }
    } else {
      req.query.cache = true
    }
    try {
      await routeHandler(req, res, next)
    } catch (err) {
      res.status(500).json({error: 'internal server error'})
      next(err)
    }
  }
}

function notAllowed (req, res) {
  res.status(405).json({error: 'method not allowed'})
}

var router = express.Router()

router.route('/url_info')
    .get(errorChecking(checkUrlApi))
    .all(errorChecking(notAllowed))

router.route('/html_extract')
    .get(errorChecking(extractUrlApi))
    .all(errorChecking(notAllowed))

router.route('/oembed')
    .get(errorChecking(oembedApi))
    .all(errorChecking(notAllowed))

router.route('/all')
    .get(errorChecking(allApi))
    .all(errorChecking(notAllowed))

let app = express()
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use('/api/url-extract', router)

console.log(`STARTING: url-extract service on port ${process.env.PORT}`)
app.listen(process.env.PORT).on('error', err => {
  console.error(`ERROR: ${err.message}`)
})
