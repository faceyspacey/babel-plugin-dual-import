/* eslint-disable */

var ADDED = {};

module.exports = function(chunkName) {
  var href = getHref(chunkName)
  if (!href) {
    if (process.env.NODE_ENV === 'development') {
      if (typeof window === 'undefined' || !window.__CSS_CHUNKS__) {
        console.warn(
          '[DUAL-IMPORT] no css chunks hash found at "window.__CSS_CHUNKS__"'
        )
        return
      }

      console.warn(
        '[DUAL-IMPORT] no chunk, ',
        chunkName,
        ', found in "window.__CSS_CHUNKS__"'
      )
    }

    return
  }

  if (ADDED[href] === 'pending') {
    return Promise.reject();
  }
  if (ADDED[href] === 'resolved') {
    return Promise.resolve();
  }

  ADDED[href] = 'pending';

  var head = document.getElementsByTagName('head')[0]
  var link = document.createElement('link')

  link.href = href
  link.charset = 'utf-8'
  link.type = 'text/css'
  link.rel = 'stylesheet'
  link.timeout = 30000

  return new Promise(function(resolve, reject) {
    var timeout

    link.onerror = function() {
      link.onerror = link.onload = null // avoid mem leaks in IE.
      clearTimeout(timeout)
      var message = 'could not load css chunk:${chunkName}'
      ADDED[href] = 'rejected';
      reject(new Error(message))
    }

    // link.onload doesn't work well enough, but this will handle it
    // since images can't load css (this is a popular fix)
    var img = document.createElement('img')
    img.onerror = function() {
      link.onerror = img.onerror = null // avoid mem leaks in IE.
      clearTimeout(timeout)
      ADDED[href] = 'resolved';
      resolve()
    }

    timeout = setTimeout(link.onerror, link.timeout)
    head.appendChild(link)
    img.src = href
  })
}

function getHref(chunkName) {
  if (typeof window === 'undefined' || !window.__CSS_CHUNKS__) return null
  return window.__CSS_CHUNKS__[chunkName]
}
