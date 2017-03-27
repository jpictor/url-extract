import Memcached from 'memcached'

const docCache = new Memcached(process.env.MEMCACHED_SERVER, {})

export function docCacheGet (prefix, url) {
  return new Promise(function (resolve) {
    docCache.get(`${prefix}.${url}`, function (err, data) {
      resolve(data)
    })
  })
}

export function docCacheSet (prefix, url, doc) {
  return new Promise(function (resolve) {
    docCache.set(`${prefix}.${url}`, doc, 3600, function (err) {
      resolve()
    })
  })
}
