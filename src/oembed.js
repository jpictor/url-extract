import URL from 'url'
import rp from 'request-promise'
import * as cache from './cache'

export async function oembedApiDoc (url, useCache = true) {
  if (useCache) {
    const cacheDoc = await cache.docCacheGet('oembed', url)
    if (cacheDoc) {
      return cacheDoc
    }
  }
  const responses = await Promise.all([
    directOembedRequest(url)
  ])
  const doc = {
    direct: responses[0]
  }
  cache.docCacheSet('oembed', url, doc)
  return doc
}

export function directOembedRequest (url) {
  let p = URL.parse(url)
  let options = {
    method: 'GET',
    uri: `${p.protocol}//${p.host}/oembed`,
    qs: {
      url: url,
      secure: true
    },
    json: true,
    timeout: 10000,
    strictSSL: false
  }
  return rp(options).then(doc => {
    if (doc instanceof Object) {
      return doc
    }
    return null
  }).catch(err => {
    return null
  })
}
