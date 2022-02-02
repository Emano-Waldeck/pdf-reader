'use strict';

// self.importScripts('overwrite.js');
// self.importScripts('context.js');

const build = href => {
  if (href.indexOf('www.google.') !== -1 && href.indexOf('/url?') !== -1 && href.indexOf('&url=') !== -1) {
    href = decodeURIComponent(href.split('&url=')[1].split('&')[0]);
  }
  // const splitter = href.indexOf('?') === -1 ? (href.indexOf('#') === -1 ? '' : '#') : '?';
  const splitter = href.indexOf('#') === -1 ? '' : '#';
  if (splitter) {
    const [root, args] = href.split(splitter);
    return chrome.runtime.getURL('/data/pdf.js/web/viewer.html') + '?file=' + encodeURIComponent(root) + splitter + args;
  }
  else {
    return chrome.runtime.getURL('/data/pdf.js/web/viewer.html') + '?file=' + encodeURIComponent(href);
  }
};

// remote sources
const observe = ({frameId, tabId, url, method, responseHeaders}) => {
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

  // test on embedded PDFs
  // chrome.scripting.executeScript({
  //   target: {
  //     tabId,
  //     frameIds: [frameId]
  //   },
  //   func: href => {
  //     console.log(123);
  //     location.replace(href);
  //   },
  //   args: [build(url)]
  // });

  return {
    redirectUrl: build(url)
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
  }, ['responseHeaders', 'blocking']);
});
start();
chrome.storage.onChanged.addListener(ps => {
  if (ps.frames) {
    start();
  }
});

/* local sources */
chrome.extension.isAllowedFileSchemeAccess(allow => allow && chrome.webNavigation.onBeforeNavigate.addListener(({
  url,
  tabId,
  frameId
}) => {
  if (frameId === 0) {
    if (url.includes('pdfjs.action=download')) {
      return;
    }
    url = build(url);
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

/* file handling */
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

/* action */
chrome.action.onClicked.addListener(() => chrome.tabs.create({
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
            tabs.query({active: true, currentWindow: true}, tbs => tabs.create({
              url: page + '?version=' + version + (previousVersion ? '&p=' + previousVersion : '') + '&type=' + reason,
              active: reason === 'install',
              ...(tbs && tbs.length && {index: tbs[0].index + 1})
            }));
            storage.local.set({'last-update': Date.now()});
          }
        }
      }));
    });
    setUninstallURL(page + '?rd=feedback&name=' + encodeURIComponent(name) + '&version=' + version);
  }
}
