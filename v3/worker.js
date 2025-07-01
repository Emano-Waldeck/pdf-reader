'use strict';

self.importScripts('context.js', 'managed.js');

// TO-DO: Do not overwrite viewer.html and use the following instead
// https://www.w3docs.com/tools/code-editor/1085
// https://www.w3docs.com/tools/code-editor/1077
// self.importScripts('overwrite.js');

chrome.webNavigation.onCommitted.addListener((details) => {
  if (details.url.startsWith('blob:')) {
    chrome.scripting.executeScript({
      target: {
        tabId: details.tabId,
        frameIds: [details.frameId]
      },
      files: ['data/watch.js']
    });
  }
});

chrome.runtime.onMessage.addListener((request, sender) => {
  if (request.method === 'open-viewer') {
    if (sender.frameId === 0) {
      chrome.tabs.update(sender.tab.id, {
        url: request.viewer
      });
    }
  }
  else if (request.method === 'notify') {
    chrome.action.setBadgeText({
      text: 'E',
      tabId: sender.tab.id
    });
    chrome.action.setTitle({
      title: request.message || 'NA',
      tabId: sender.tab.id
    });
    chrome.action.setBadgeBackgroundColor({
      color: 'red',
      tabId: sender.tab.id
    });
  }
});

/* action */
chrome.action.onClicked.addListener(() => chrome.tabs.create({
  url: '/data/pdf.js/web/viewer.html?file=/data/viewer/welcome.pdf'
}));

/* FAQs & Feedback */
{
  chrome.management = chrome.management || {
    getSelf(c) {
      c({installType: 'normal'});
    }
  };
  if (navigator.webdriver !== true) {
    const {homepage_url: page, name, version} = chrome.runtime.getManifest();
    chrome.runtime.onInstalled.addListener(({reason, previousVersion}) => {
      chrome.management.getSelf(({installType}) => installType === 'normal' && chrome.storage.local.get({
        'faqs': true,
        'last-update': 0
      }, prefs => {
        if (reason === 'install' || (prefs.faqs && reason === 'update')) {
          const doUpdate = (Date.now() - prefs['last-update']) / 1000 / 60 / 60 / 24 > 45;
          if (doUpdate && previousVersion !== version) {
            chrome.tabs.query({active: true, lastFocusedWindow: true}, tbs => chrome.tabs.create({
              url: page + '?version=' + version + (previousVersion ? '&p=' + previousVersion : '') + '&type=' + reason,
              active: reason === 'install',
              ...(tbs && tbs.length && {index: tbs[0].index + 1})
            }));
            chrome.storage.local.set({'last-update': Date.now()});
          }
        }
      }));
    });
    chrome.runtime.setUninstallURL(page + '?rd=feedback&name=' + encodeURIComponent(name) + '&version=' + version);
  }
}
