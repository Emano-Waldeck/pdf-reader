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
  types: ['main_frame']
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
    pathSuffix: '.pdf'
  }, {
    urlPrefix: 'file://',
    pathSuffix: '.PDF'
  }]
}));
// Context menu
chrome.contextMenus.create({
  type: 'normal',
  id: 'open-with',
  title: 'Open with PDF Reader',
  contexts: ['link'],
  targetUrlPatterns: ['*://*/*.PDF', '*://*/*']
});
chrome.contextMenus.create({
  type: 'normal',
  id: 'open-with-bg',
  title: 'Open with PDF Reader (background)',
  contexts: ['link'],
  targetUrlPatterns: ['*://*/*.PDF', '*://*/*']
});
chrome.contextMenus.onClicked.addListener(({menuItemId, linkUrl}, tab) => {
  if (menuItemId.startsWith('open-with')) {
    chrome.tabs.create({
      url: chrome.runtime.getURL(
        '/data/pdf.js/web/viewer.html?file=' + encodeURIComponent(linkUrl)
      ),
      index: tab.index + 1,
      active: menuItemId.endsWith('-bg') === false
    });
  }
});

// FAQs & Feedback
chrome.storage.local.get({
  'version': null,
  'faqs': true,
  'last-update': 0
}, prefs => {
  const version = chrome.runtime.getManifest().version;

  if (prefs.version ? (prefs.faqs && prefs.version !== version) : true) {
    const now = Date.now();
    const doUpdate = (now - prefs['last-update']) / 1000 / 60 / 60 / 24 > 30;
    chrome.storage.local.set({
      version,
      'last-update': doUpdate ? Date.now() : prefs['last-update']
    }, () => {
      // do not display the FAQs page if last-update occurred less than 30 days ago.
      if (doUpdate) {
        const p = Boolean(prefs.version);
        chrome.tabs.create({
          url: chrome.runtime.getManifest().homepage_url + '?version=' + version +
            '&type=' + (p ? ('upgrade&p=' + prefs.version) : 'install'),
          active: p === false
        });
      }
    });
  }
});

{
  const {name, version} = chrome.runtime.getManifest();
  chrome.runtime.setUninstallURL(
    chrome.runtime.getManifest().homepage_url + '?rd=feedback&name=' + name + '&version=' + version
  );
}
