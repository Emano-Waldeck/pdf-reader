'use strict';

self.importScripts('context.js', 'managed.js');

// TO-DO: Do not overwrite viewer.html and use the following instead
// https://www.w3docs.com/tools/code-editor/1085
// https://www.w3docs.com/tools/code-editor/1077
// self.importScripts('overwrite.js');

chrome.runtime.onMessage.addListener((request, sender) => {
  if (request.method === 'open-viewer') {
    if (sender.frameId === 0) {
      chrome.tabs.update(sender.tab.id, {
        url: request.viewer
      });
    }
  }
});

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
            tabs.query({active: true, lastFocusedWindow: true}, tbs => tabs.create({
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
