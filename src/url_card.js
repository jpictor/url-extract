import cheerio from 'cheerio'

export function cardApiDoc (allDoc) {
  let oembeds = allDoc.oembed
  let htmlExtract = allDoc.html_extract
  let urlInfo = allDoc.url_info

  let cardDoc = {
    url: urlInfo.url,
    resolved_url: null,
    content_type: null,
    oembed_type: null,
    oembed_url: null,
    title: null,
    description: null,
    html: null,
    provider_name: null,
    provider_url: null,
    width: null,
    height: null,
    image: {
      url: null,
      width: null,
      height: null
    },
    og: {
      type: null,
      title: null,
      description: null,
      image: null
    },
    twitter: {
      title: null,
      image: null,
      description: null,
      site: null,
      creator: null
    }
  }

  if (urlInfo) {
    if (urlInfo.resolved_url) {
      cardDoc.resolved_url = urlInfo.resolved_url
    }
    if (urlInfo.content_type) {
      cardDoc.content_type = urlInfo.content_type
    }
  }

  if (oembeds) {
    cardDoc.oembed_type = bestOEmbed(oembeds, 'type')
    cardDoc.oembed_url = bestOEmbed(oembeds, 'url')
    cardDoc.title = bestOEmbed(oembeds, 'title')
    cardDoc.description = bestOEmbed(oembeds, 'description')
    cardDoc.html = bestOEmbed(oembeds, 'html')
    cardDoc.width = bestOEmbed(oembeds, 'width')
    cardDoc.height = bestOEmbed(oembeds, 'height')
    let thumbnailUrl = bestOEmbed(oembeds, 'thumbnail_url')
    if (thumbnailUrl) {
      cardDoc.image.url = thumbnailUrl
      cardDoc.image.width = bestOEmbed(oembeds, 'thumbnail_width')
      cardDoc.image.height = bestOEmbed(oembeds, 'thumbnail_height')
    }
    cardDoc.provider_name = bestOEmbed(oembeds, 'provider_name')
    cardDoc.provider_url = bestOEmbed(oembeds, 'provider_url')
  }

  if (htmlExtract) {
    if (htmlExtract.page_status === 'success' && htmlExtract.status_code === 200) {
      if (!cardDoc.title && htmlExtract.title) {
        cardDoc.title = htmlExtract.title
      }
      if (htmlExtract.content) {
        let $ = cheerio.load(htmlExtract.content)
        cardDoc.og.type = $('meta[property="og:type"]').attr('content') || null
        cardDoc.og.title = $('meta[property="og:title"]').attr('content') || null
        cardDoc.og.description = $('meta[property="og:description"]').attr('content') || null
        cardDoc.og.image = $('meta[property="og:image"]').attr('content') || null
        cardDoc.twitter.title = $('meta[property="twitter:title"]').attr('content') || null
        cardDoc.twitter.image = $('meta[property="twitter:image"]').attr('content') || null
        cardDoc.twitter.description = $('meta[property="twitter:description"]').attr('content') || null
        cardDoc.twitter.site = $('meta[property="twitter:site"]').attr('content') || null
        cardDoc.twitter.creator = $('meta[property="twitter:creator"]').attr('content') || null
      }
      if (!cardDoc.description) {
        cardDoc.description = cardDoc.og.description || cardDoc.twitter.description
      }
    }
  }
  return cardDoc
}

function bestOEmbed (oembeds, field) {
  let docs = [oembeds.direct]
  for (let i = 0; i < docs.length; ++i) {
    let doc = docs[i]
    if (doc) {
      let value = doc[field]
      if (value) {
        return value
      }
    }
  }
  return null
}
