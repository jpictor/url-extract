import phantom from 'phantom'
import htmlToText from 'html-to-text'
import { get } from 'lodash'
import * as cache from './cache'

async function timeoutPromise (duration) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, duration)
  })
}

export async function extractUrlApiDoc (url, useCache = true) {
  if (useCache) {
    let cacheDoc = await cache.docCacheGet('extracturl', url)
    if (cacheDoc) {
      return cacheDoc
    }
  }

  const phantomCli = await phantom.create(['--ignore-ssl-errors=true', '--local-to-remote-url-access=true'])
  try {
    let page = await phantomCli.createPage()
    await page.setting('settings.resourceTimeout', '5000')
    await page.setting('settings.loadImages', false)
    await page.property('viewportSize', {width: 1024, height: 768})
    await page.property('zoomFactor', 1.0)
    await page.property('clipRect', {top: 0, left: 0, width: 1024, height: 512})

    let resources = []
    await page.on('onResourceReceived', function (response) {
      if (response.stage !== 'start') return  // check if the resource is done downloading
      if (!response.url || response.url.startsWith('data:')) return  // only record images
      resources.push({
        url: response.url,
        status_code: response.status,
        content_type: response.contentType
      })
    })

    let status = await page.open(url)
    await timeoutPromise(2000)

    let content = null
    // let plainText = null
    let finalUrl = null
    let title = null
    if (status === 'success') {
      content = await page.property('content')
      // plainText = await page.property('plainText')
      finalUrl = await page.property('url')
      title = await page.property('title')
    }

    const readabilityPath = `${__dirname}/Readability.js`
    console.log(`LOADING: ${readabilityPath}`)
    const injectWorked = await page.injectJs(readabilityPath)
    if (!injectWorked) {
      console.error('INJECT FAILED')
    }

    const readability = await page.evaluate(runReadability)
    const readabilityContent = get(readability, 'content', '')
    let readabilityPlainText = ''
    if (readabilityContent) {
      readabilityPlainText = htmlToText.fromString(readabilityContent, {
        wordwrap: 80
      })
    }

    // console.log(`READABILITY=${JSON.stringify(readability)}`)
    await page.close()

    // find the status code and resolved URL of the requested URL first text/html that isn't a 301
    let resolvedUrl = null
    let statusCode = null
    for (let i = 0; i < resources.length; ++i) {
      let resource = resources[i]
      if (resource.content_type && resource.content_type.startsWith('text/html')) {
        if (resource.status_code === 301) {
          continue
        }
        resolvedUrl = resource.url
        statusCode = resource.status_code
      }
      break
    }

    let doc = {
      url: url,
      page_status: status,
      final_url: finalUrl,
      resolved_url: resolvedUrl,
      status_code: statusCode,
      content: content,
      readability: readabilityContent,
      text: readabilityPlainText,
      title: title,
      resources: resources
    }
    await cache.docCacheSet('extracturl', url, doc)
    return doc
  } finally {
    phantomCli.exit()
  }
}

function runReadability () {
  let location = document.location

  let uri = {
    spec: location.href,
    host: location.host,
    prePath: location.protocol + '//' + location.host, // TODO This is incomplete, needs username/password and port
    scheme: location.protocol.substr(0, location.protocol.indexOf(':')),
    pathBase: location.protocol + '//' + location.host + location.pathname.substr(0, location.pathname.lastIndexOf('/') + 1)
  }

  try {
    var readabilityObj = new Readability(uri, document)
    var isProbablyReaderable = readabilityObj.isProbablyReaderable()
    var result = readabilityObj.parse()
    if (result) {
      result.isProbablyReaderable = isProbablyReaderable
    } else {
      result = {
        error: {
          message: 'Empty result from Readability.js.',
          sourceHTML: 'Empty page content.'
        }
      }
    }
    return result
  } catch (err) {
    return {
      error: {
        message: err.message,
        line: err.line,
        stack: err.stack,
        sourceHTML: 'Empty page content.'
      }
    }
  }
}
