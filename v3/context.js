const context = () => {
  chrome.contextMenus.create({
    id: 'open-with',
    title: 'Open with PDF Reader',
    contexts: ['link'],
    targetUrlPatterns: ['*://*/*.PDF', '*://*/*']
  }, () => chrome.runtime.lastError);
  chrome.contextMenus.create({
    id: 'open-with-bg',
    title: 'Open with PDF Reader (background)',
    contexts: ['link'],
    targetUrlPatterns: ['*://*/*.PDF', '*://*/*']
  }, () => chrome.runtime.lastError);
  chrome.storage.local.get({
    frames: false
  }, prefs => chrome.contextMenus.create({
    id: 'support-embedded-pdfs',
    title: 'Support embedded PDFs',
    contexts: ['action', 'browser_action'],
    type: 'checkbox',
    checked: prefs.frames
  }, () => chrome.runtime.lastError));
  chrome.contextMenus.create({
    id: 'theme',
    title: 'Themes',
    contexts: ['action', 'browser_action']
  }, () => chrome.runtime.lastError);
  chrome.contextMenus.create({
    id: 'options',
    title: 'Rendering Options',
    contexts: ['action', 'browser_action']
  }, () => chrome.runtime.lastError);
  chrome.storage.local.get({
    'theme': 'os-theme',
    'enableScripting': true,
    'disablePageLabels': false,
    'enablePermissions': false,
    'enablePrintAutoRotate': false,
    'enableWebGL': false,
    'historyUpdateUrl': true,
    'ignoreDestinationZoom': false,
    'pdfBugEnabled': false,
    'useOnlyCssZoom': false,
    'disableAutoFetch': false,
    'disableFontFace': false,
    'disableRange': false,
    'disableStream': false,
    'annotationMode': 2
  }, prefs => {
    chrome.contextMenus.create({
      id: 'os-theme',
      title: 'OS Theme',
      contexts: ['action', 'browser_action'],
      parentId: 'theme',
      type: 'radio',
      checked: prefs.theme === 'os-theme'
    }, () => chrome.runtime.lastError);
    chrome.contextMenus.create({
      id: 'dark-1',
      title: 'Dark Theme',
      contexts: ['action', 'browser_action'],
      parentId: 'theme',
      type: 'radio',
      checked: prefs.theme === 'dark-1'
    }, () => chrome.runtime.lastError);
    chrome.contextMenus.create({
      id: 'light-1',
      title: 'Light Theme',
      contexts: ['action', 'browser_action'],
      parentId: 'theme',
      type: 'radio',
      checked: prefs.theme === 'light-1'
    }, () => chrome.runtime.lastError);
    chrome.contextMenus.create({
      id: 'enableScripting',
      title: 'Enable Scripting',
      contexts: ['action', 'browser_action'],
      parentId: 'options',
      type: 'checkbox',
      checked: prefs.enableScripting
    }, () => chrome.runtime.lastError);
    chrome.contextMenus.create({
      id: 'disablePageLabels',
      title: 'Disable Page Labels',
      contexts: ['action', 'browser_action'],
      parentId: 'options',
      type: 'checkbox',
      checked: prefs.disablePageLabels
    }, () => chrome.runtime.lastError);
    chrome.contextMenus.create({
      id: 'enablePermissions',
      title: 'Enable Permissions',
      contexts: ['action', 'browser_action'],
      parentId: 'options',
      type: 'checkbox',
      checked: prefs.enablePermissions
    }, () => chrome.runtime.lastError);
    chrome.contextMenus.create({
      id: 'enablePrintAutoRotate',
      title: 'Enable Print Auto-Rotate',
      contexts: ['action', 'browser_action'],
      parentId: 'options',
      type: 'checkbox',
      checked: prefs.enablePrintAutoRotate
    }, () => chrome.runtime.lastError);
    chrome.contextMenus.create({
      id: 'enableWebGL',
      title: 'Enable WebGL',
      contexts: ['action', 'browser_action'],
      parentId: 'options',
      type: 'checkbox',
      checked: prefs.enableWebGL
    }, () => chrome.runtime.lastError);
    chrome.contextMenus.create({
      id: 'historyUpdateUrl',
      title: 'History Update URL',
      contexts: ['action', 'browser_action'],
      parentId: 'options',
      type: 'checkbox',
      checked: prefs.historyUpdateUrl
    }, () => chrome.runtime.lastError);
    chrome.contextMenus.create({
      id: 'ignoreDestinationZoom',
      title: 'Ignore Destination Zoom',
      contexts: ['action', 'browser_action'],
      parentId: 'options',
      type: 'checkbox',
      checked: prefs.ignoreDestinationZoom
    }, () => chrome.runtime.lastError);
    chrome.contextMenus.create({
      id: 'pdfBugEnabled',
      title: 'PDF Bug Enabled',
      contexts: ['action', 'browser_action'],
      parentId: 'options',
      type: 'checkbox',
      checked: prefs.pdfBugEnabled
    }, () => chrome.runtime.lastError);
    chrome.contextMenus.create({
      id: 'annotationMode',
      title: 'Annotation Mode',
      contexts: ['action', 'browser_action'],
      parentId: 'options'
    }, () => chrome.runtime.lastError);
    chrome.contextMenus.create({
      id: 'annotationMode:0',
      title: 'Disable',
      contexts: ['action', 'browser_action'],
      parentId: 'annotationMode',
      type: 'radio',
      checked: prefs.annotationMode === 0
    }, () => chrome.runtime.lastError);
    chrome.contextMenus.create({
      id: 'annotationMode:1',
      title: 'Enable',
      contexts: ['action', 'browser_action'],
      parentId: 'annotationMode',
      type: 'radio',
      checked: prefs.annotationMode === 1
    }, () => chrome.runtime.lastError);
    chrome.contextMenus.create({
      id: 'annotationMode:2',
      title: 'Enable Forms',
      contexts: ['action', 'browser_action'],
      parentId: 'annotationMode',
      type: 'radio',
      checked: prefs.annotationMode === 2
    }, () => chrome.runtime.lastError);
    chrome.contextMenus.create({
      id: 'annotationMode:3',
      title: 'Enable Storage',
      contexts: ['action', 'browser_action'],
      parentId: 'annotationMode',
      type: 'radio',
      checked: prefs.annotationMode === 3
    }, () => chrome.runtime.lastError);
    chrome.contextMenus.create({
      id: 'useOnlyCssZoom',
      title: 'Use Only CSS Zoom',
      contexts: ['action', 'browser_action'],
      parentId: 'options',
      type: 'checkbox',
      checked: prefs.useOnlyCssZoom
    }, () => chrome.runtime.lastError);
    chrome.contextMenus.create({
      id: 'disableAutoFetch',
      title: 'Disable Auto Fetch',
      contexts: ['action', 'browser_action'],
      parentId: 'options',
      type: 'checkbox',
      checked: prefs.disableAutoFetch
    }, () => chrome.runtime.lastError);
    chrome.contextMenus.create({
      id: 'disableFontFace',
      title: 'Disable Font Face',
      contexts: ['action', 'browser_action'],
      parentId: 'options',
      type: 'checkbox',
      checked: prefs.disableFontFace
    }, () => chrome.runtime.lastError);
    chrome.contextMenus.create({
      id: 'disableRange',
      title: 'Disable Range',
      contexts: ['action', 'browser_action'],
      parentId: 'options',
      type: 'checkbox',
      checked: prefs.disableRange
    }, () => chrome.runtime.lastError);
    chrome.contextMenus.create({
      id: 'disableStream',
      title: 'Disable Stream',
      contexts: ['action', 'browser_action'],
      parentId: 'options',
      type: 'checkbox',
      checked: prefs.disableStream
    }, () => chrome.runtime.lastError);
  });
};
chrome.runtime.onInstalled.addListener(context);
chrome.runtime.onStartup.addListener(context);

chrome.contextMenus.onClicked.addListener(({menuItemId, linkUrl, checked}, tab) => {
  if (menuItemId.startsWith('open-with')) {
    const args = new URLSearchParams();
    args.set('file', linkUrl);
    args.set('context', 'menu');
    const url = chrome.runtime.getURL('/data/pdf.js/web/viewer.html') + '?' + args.toString();

    chrome.tabs.create({
      url,
      index: tab.index + 1,
      active: menuItemId.endsWith('-bg') === false
    });
  }
  else if (menuItemId.startsWith('annotationMode')) {
    chrome.storage.local.set({
      'annotationMode': Number(menuItemId.slice(-1))
    });
  }
  else if (menuItemId === 'support-embedded-pdfs') {
    chrome.storage.local.set({
      frames: checked
    });
  }
  else if (menuItemId.startsWith('dark-') || menuItemId.startsWith('light-') || menuItemId === 'os-theme') {
    chrome.storage.local.set({
      theme: menuItemId
    });
  }
  else {
    chrome.storage.local.set({
      [menuItemId]: checked
    });
  }
});
