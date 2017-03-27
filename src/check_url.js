import rp from 'request-promise'
import rpErrors from 'request-promise/errors'
import * as cache from './cache'

export async function checkUrlApiDoc (url, useCache = true) {
  if (useCache) {
    let cacheDoc = await cache.docCacheGet('checkurl', url)
    if (cacheDoc) {
      return cacheDoc
    }
  }

  let options = {
    method: 'HEAD',
    uri: url,
    resolveWithFullResponse: true,
    timeout: 10000,
    strictSSL: false
  }

  let doc = {url: url}

  try {
    let response = await rp(options)
    doc.resolved_url = response.request.uri.href
    doc.status_code = response.statusCode
    doc.content_type = response.headers['content-type']
    doc.headers = response.headers
  } catch (e) {
    if (e instanceof rpErrors.StatusCodeError) {
      doc.status_code = e.statusCode
    } else if (e instanceof rpErrors.RequestError) {
      doc.error = e.cause
    } else {
      throw e
    }
  }

  cache.docCacheSet('checkurl', url, doc)
  return doc
}
