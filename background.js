'use strict';

// remote sources
const observe = ({url, method, responseHeaders}) => {
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
  // chrome.tabs.update(tabId, {
  //   url: '/data/pdf.js/web/viewer.html?file=' + encodeURIComponent(url)
  // });
  return {
    redirectUrl: chrome.runtime.getURL('/data/pdf.js/web/viewer.html') + '?file=' + encodeURIComponent(url)
  };
};
const start = () => chrome.storage.local.get({
  frames: false
}, prefs => {
  const types = ['main_frame'];
  if (prefs.frames) {
    types.push('sub_frame');
  }

  chrome.webRequest.onHeadersReceived.removeListener(observe);
  chrome.webRequest.onHeadersReceived.addListener(observe, {
    urls: ['<all_urls>'],
    types
  }, ['blocking', 'responseHeaders']);
});
start();
chrome.storage.onChanged.addListener(ps => {
  if (ps.frames) {
    start();
  }
});


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
  id: 'open-with',
  title: 'Open with PDF Reader',
  contexts: ['link'],
  targetUrlPatterns: ['*://*/*.PDF', '*://*/*']
});
chrome.contextMenus.create({
  id: 'open-with-bg',
  title: 'Open with PDF Reader (background)',
  contexts: ['link'],
  targetUrlPatterns: ['*://*/*.PDF', '*://*/*']
});
chrome.storage.local.get({
  frames: false
}, prefs => chrome.contextMenus.create({
  id: 'support-embedded-pdfs',
  title: 'Support embedded PDFs',
  contexts: ['browser_action'],
  type: 'checkbox',
  checked: prefs.frames
}));
chrome.contextMenus.onClicked.addListener(({menuItemId, linkUrl, checked}, tab) => {
  if (menuItemId.startsWith('open-with')) {
    if (linkUrl.indexOf('www.google.') !== -1 && linkUrl.indexOf('/url?') !== -1 && linkUrl.indexOf('&url=') !== -1) {
      linkUrl = decodeURIComponent(linkUrl.split('&url=')[1].split('&')[0]);
    }
    chrome.tabs.create({
      url: chrome.runtime.getURL(
        '/data/pdf.js/web/viewer.html?file=' + encodeURIComponent(linkUrl)
      ),
      index: tab.index + 1,
      active: menuItemId.endsWith('-bg') === false
    });
  }
  else if (menuItemId === 'support-embedded-pdfs') {
    chrome.storage.local.set({
      frames: checked
    });
  }
});

// browser action
chrome.browserAction.onClicked.addListener(() => chrome.tabs.create({
  url: '/data/pdf.js/web/viewer.html?file=/data/viewer/welcome.pdf'
}));

/* FAQs & Feedback */
{
  const {management, runtime: {onInstalled, setUninstallURL, getManifest}, storage, tabs} = chrome;
  if (navigator.webdriver !== true) {
    const page = getManifest().homepage_url;
    const {name, version} = getManifest();
    onInstalled.addListener(({reason, previousVersion}) => {
      management.getSelf(({installType}) => installType === 'normal' && storage.local.get({
        'faqs': true,
        'last-update': 0
      }, prefs => {
        if (reason === 'install' || (prefs.faqs && reason === 'update')) {
          const doUpdate = (Date.now() - prefs['last-update']) / 1000 / 60 / 60 / 24 > 45;
          if (doUpdate && previousVersion !== version) {
            tabs.create({
              url: page + '?version=' + version + (previousVersion ? '&p=' + previousVersion : '') + '&type=' + reason,
              active: reason === 'install'
            });
            storage.local.set({'last-update': Date.now()});
          }
        }
      }));
    });
    setUninstallURL(page + '?rd=feedback&name=' + encodeURIComponent(name) + '&version=' + version);
  }
}
