'use strict';

// remote sources
chrome.webRequest.onHeadersReceived.addListener(({url, method, responseHeaders}) => {
  if (method !== 'GET') {
    return;
  }
  if (url.includes('pdfjs.action=download')) {
    return;
  }

  const name = () => {
    const header = responseHeaders.filter(h => h.name.toLowerCase() === 'content-disposition').shift();
    return header && /\.pdf(["']|$)/i.test(header.value);
  };

  const type = () => {
    const header = responseHeaders.filter(h => h.name.toLowerCase() === 'content-type').shift();
    if (header) {
      var headerValue = header.value.toLowerCase().split(';', 1)[0].trim();
      if (headerValue === 'application/pdf') {
        return true;
      }
      if (headerValue === 'application/octet-stream') {
        if (url.toLowerCase().indexOf('.pdf') > 0) {
          return true;
        }

        return name();
      }
    }
  };
  if (type() !== true) {
    return;
  }
  const redirectUrl = chrome.runtime.getURL(
    '/data/pdf.js/web/viewer.html?file=' + encodeURIComponent(url)
  );
  return {
    redirectUrl
  };
}, {
  urls: ['<all_urls>'],
  types: ['main_frame'],
}, ['blocking', 'responseHeaders']);

// local sources
chrome.extension.isAllowedFileSchemeAccess(allow => allow && chrome.webNavigation.onBeforeNavigate.addListener(({url, tabId, frameId}) => {
  if (frameId === 0) {
    if (url.includes('pdfjs.action=download')) {
      return;
    }
    url = chrome.runtime.getURL(
      '/data/pdf.js/web/viewer.html?file=' + encodeURIComponent(url)
    );
    chrome.tabs.update(tabId, {
      url
    });
  }
}, {
  url: [{
    urlPrefix: 'file://',
    pathSuffix: '.pdf',
  }, {
    urlPrefix: 'file://',
    pathSuffix: '.PDF',
  }],
}));
