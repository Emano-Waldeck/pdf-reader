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
      const headerValue = header.value.toLowerCase().split(';', 1)[0].trim();
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
chrome.extension.isAllowedFileSchemeAccess(allow => allow && chrome.webNavigation.onBeforeNavigate.addListener(({
  url,
  tabId,
  frameId
}) => {
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
// file handling
if (chrome.fileBrowserHandler) {
  chrome.fileBrowserHandler.onExecute.addListener((id, details) => {
    if (id === 'open-as-pdf') {
      const entries = details.entries;
      for (const entry of entries) {
        chrome.tabs.create({
          url: chrome.runtime.getURL(
            '/data/pdf.js/web/viewer.html?file=' + encodeURIComponent(entry.toURL())
          )
        });
      }
    }
  });
}
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

// browser action
chrome.browserAction.onClicked.addListener(() => chrome.tabs.create({
  url: '/data/pdf.js/web/viewer.html?file=/data/viewer/welcome.pdf'
}));

// FAQs & Feedback
{
  const {onInstalled, setUninstallURL, getManifest} = chrome.runtime;
  const {name, version} = getManifest();
  const page = getManifest().homepage_url;
  onInstalled.addListener(({reason, previousVersion}) => {
    chrome.storage.local.get({
      'faqs': true,
      'last-update': 0
    }, prefs => {
      if (reason === 'install' || (prefs.faqs && reason === 'update')) {
        const doUpdate = (Date.now() - prefs['last-update']) / 1000 / 60 / 60 / 24 > 45;
        if (doUpdate && previousVersion !== version) {
          chrome.tabs.create({
            url: page + '?version=' + version +
              (previousVersion ? '&p=' + previousVersion : '') +
              '&type=' + reason,
            active: reason === 'install'
          });
          chrome.storage.local.set({'last-update': Date.now()});
        }
      }
    });
  });
  setUninstallURL(page + '?rd=feedback&name=' + encodeURIComponent(name) + '&version=' + version);
}
