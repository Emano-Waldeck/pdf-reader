const context = () => {
  if (context.done) {
    return;
  }
  context.done = true;

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
    'disablehistory': false,
    'historyUpdateUrl': true,
    'ignoreDestinationZoom': false,
    'pdfBugEnabled': false,
    'useOnlyCssZoom': false,
    'disableAutoFetch': false,
    'disableFontFace': false,
    'disableRange': false,
    'disableStream': false,
    'annotationMode': 2,
    'defaultTool': 0, // SELECT: 0, HAND: 1, ZOOM: 2,
    'defaultZoomValue': 'auto',
    'spreadModeOnLoad': 0,
    'scrollModeOnLoad': 0
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
      id: 'sidebarViewOnLoad',
      title: 'Sidebar Mode',
      contexts: ['action', 'browser_action'],
      parentId: 'options'
    }, () => chrome.runtime.lastError);
    chrome.contextMenus.create({
      id: 'sidebarViewOnLoad:0',
      title: 'Do not display sidebar',
      contexts: ['action', 'browser_action'],
      parentId: 'sidebarViewOnLoad',
      type: 'radio',
      checked: prefs.sidebarViewOnLoad === 0
    }, () => chrome.runtime.lastError);
    chrome.contextMenus.create({
      id: 'sidebarViewOnLoad:1',
      title: 'Show thumbnails',
      contexts: ['action', 'browser_action'],
      parentId: 'sidebarViewOnLoad',
      type: 'radio',
      checked: prefs.sidebarViewOnLoad === 1
    }, () => chrome.runtime.lastError);
    chrome.contextMenus.create({
      id: 'sidebarViewOnLoad:2',
      title: 'Show outline',
      contexts: ['action', 'browser_action'],
      parentId: 'sidebarViewOnLoad',
      type: 'radio',
      checked: prefs.sidebarViewOnLoad === 2
    }, () => chrome.runtime.lastError);
    chrome.contextMenus.create({
      id: 'sidebarViewOnLoad:3',
      title: 'Show attachments',
      contexts: ['action', 'browser_action'],
      parentId: 'sidebarViewOnLoad',
      type: 'radio',
      checked: prefs.sidebarViewOnLoad === 3
    }, () => chrome.runtime.lastError);
    chrome.contextMenus.create({
      id: 'scrollModeOnLoad',
      title: 'Scroll Mode',
      contexts: ['action', 'browser_action'],
      parentId: 'options'
    }, () => chrome.runtime.lastError);
    chrome.contextMenus.create({
      id: 'externalLinkTarget',
      title: 'External Link Target',
      contexts: ['action', 'browser_action'],
      parentId: 'options'
    }, () => chrome.runtime.lastError);
    chrome.contextMenus.create({
      id: 'externalLinkTarget:1',
      title: 'Default Browser Behavior',
      contexts: ['action', 'browser_action'],
      parentId: 'externalLinkTarget',
      type: 'radio',
      checked: prefs.externalLinkTarget === 1
    }, () => chrome.runtime.lastError);
    chrome.contextMenus.create({
      id: 'externalLinkTarget:2',
      title: 'Opened in a Blank Tab ',
      contexts: ['action', 'browser_action'],
      parentId: 'externalLinkTarget',
      type: 'radio',
      checked: prefs.externalLinkTarget === 2
    }, () => chrome.runtime.lastError);
    chrome.contextMenus.create({
      id: 'externalLinkTarget:3',
      title: 'Open in the Parent Window',
      contexts: ['action', 'browser_action'],
      parentId: 'externalLinkTarget',
      type: 'radio',
      checked: prefs.externalLinkTarget === 3
    }, () => chrome.runtime.lastError);
    chrome.contextMenus.create({
      id: 'externalLinkTarget:4',
      title: 'Open in the Top-Level Window',
      contexts: ['action', 'browser_action'],
      parentId: 'externalLinkTarget',
      type: 'radio',
      checked: prefs.externalLinkTarget === 4
    }, () => chrome.runtime.lastError);
    chrome.contextMenus.create({
      id: 'scrollModeOnLoad',
      title: 'Scroll Mode',
      contexts: ['action', 'browser_action'],
      parentId: 'options'
    }, () => chrome.runtime.lastError);
    chrome.contextMenus.create({
      id: 'scrollModeOnLoad:3',
      title: 'Page Scrolling',
      contexts: ['action', 'browser_action'],
      parentId: 'scrollModeOnLoad',
      type: 'radio',
      checked: prefs.scrollModeOnLoad === 3
    }, () => chrome.runtime.lastError);
    chrome.contextMenus.create({
      id: 'scrollModeOnLoad:0',
      title: 'Vertical Scrolling',
      contexts: ['action', 'browser_action'],
      parentId: 'scrollModeOnLoad',
      type: 'radio',
      checked: prefs.scrollModeOnLoad === 0
    }, () => chrome.runtime.lastError);
    chrome.contextMenus.create({
      id: 'scrollModeOnLoad:1',
      title: 'Horizontal Scrolling',
      contexts: ['action', 'browser_action'],
      parentId: 'scrollModeOnLoad',
      type: 'radio',
      checked: prefs.scrollModeOnLoad === 1
    }, () => chrome.runtime.lastError);
    chrome.contextMenus.create({
      id: 'scrollModeOnLoad:2',
      title: 'Wrapped Scrolling',
      contexts: ['action', 'browser_action'],
      parentId: 'scrollModeOnLoad',
      type: 'radio',
      checked: prefs.scrollModeOnLoad === 2
    }, () => chrome.runtime.lastError);
    chrome.contextMenus.create({
      id: 'spreadModeOnLoad',
      title: 'Spreads Mode',
      contexts: ['action', 'browser_action'],
      parentId: 'options'
    }, () => chrome.runtime.lastError);
    chrome.contextMenus.create({
      id: 'spreadModeOnLoad:0',
      title: 'No Spreads',
      contexts: ['action', 'browser_action'],
      parentId: 'spreadModeOnLoad',
      type: 'radio',
      checked: prefs.spreadModeOnLoad === 0
    }, () => chrome.runtime.lastError);
    chrome.contextMenus.create({
      id: 'spreadModeOnLoad:1',
      title: 'Odd Spreads',
      contexts: ['action', 'browser_action'],
      parentId: 'spreadModeOnLoad',
      type: 'radio',
      checked: prefs.spreadModeOnLoad === 1
    }, () => chrome.runtime.lastError);
    chrome.contextMenus.create({
      id: 'spreadModeOnLoad:2',
      title: 'Even Spreads',
      contexts: ['action', 'browser_action'],
      parentId: 'spreadModeOnLoad',
      type: 'radio',
      checked: prefs.spreadModeOnLoad === 2
    }, () => chrome.runtime.lastError);
    chrome.contextMenus.create({
      id: 'defaultTool',
      title: 'Default Tool',
      contexts: ['action', 'browser_action'],
      parentId: 'options'
    }, () => chrome.runtime.lastError);
    chrome.contextMenus.create({
      id: 'defaultTool:0',
      title: 'SELECT',
      contexts: ['action', 'browser_action'],
      parentId: 'defaultTool',
      type: 'radio',
      checked: prefs.defaultTool === 0
    }, () => chrome.runtime.lastError);
    chrome.contextMenus.create({
      id: 'defaultTool:1',
      title: 'HAND',
      contexts: ['action', 'browser_action'],
      parentId: 'defaultTool',
      type: 'radio',
      checked: prefs.defaultTool === 1
    }, () => chrome.runtime.lastError);
    chrome.contextMenus.create({
      id: 'defaultTool:2',
      title: 'ZOOM',
      contexts: ['action', 'browser_action'],
      parentId: 'defaultTool',
      type: 'radio',
      checked: prefs.defaultTool === 2,
      enabled: false
    }, () => chrome.runtime.lastError);
    chrome.contextMenus.create({
      id: 'defaultZoomValue',
      title: 'Default Zoom Value',
      contexts: ['action', 'browser_action'],
      parentId: 'options'
    }, () => chrome.runtime.lastError);
    chrome.contextMenus.create({
      id: 'defaultZoomValue:auto',
      title: 'Auto',
      contexts: ['action', 'browser_action'],
      parentId: 'defaultZoomValue',
      type: 'radio',
      checked: prefs.defaultZoomValue === 'auto'
    }, () => chrome.runtime.lastError);
    chrome.contextMenus.create({
      id: 'defaultZoomValue:page-fit',
      title: 'Page Fit',
      contexts: ['action', 'browser_action'],
      parentId: 'defaultZoomValue',
      type: 'radio',
      checked: prefs.defaultZoomValue === 'page-fit'
    }, () => chrome.runtime.lastError);
    chrome.contextMenus.create({
      id: 'defaultZoomValue:page-width',
      title: 'Page Width',
      contexts: ['action', 'browser_action'],
      parentId: 'defaultZoomValue',
      type: 'radio',
      checked: prefs.defaultZoomValue === 'page-width'
    }, () => chrome.runtime.lastError);
    chrome.contextMenus.create({
      id: 'defaultZoomValue:100%',
      title: '100%',
      contexts: ['action', 'browser_action'],
      parentId: 'defaultZoomValue',
      type: 'radio',
      checked: prefs.defaultZoomValue === '100%'
    }, () => chrome.runtime.lastError);
    chrome.contextMenus.create({
      id: 'defaultZoomValue:75%',
      title: '75%',
      contexts: ['action', 'browser_action'],
      parentId: 'defaultZoomValue',
      type: 'radio',
      checked: prefs.defaultZoomValue === '75%'
    }, () => chrome.runtime.lastError);
    chrome.contextMenus.create({
      id: 'defaultZoomValue:50%',
      title: '50%',
      contexts: ['action', 'browser_action'],
      parentId: 'defaultZoomValue',
      type: 'radio',
      checked: prefs.defaultZoomValue === '50%'
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
      id: 'disablehistory',
      title: 'Disable Previous View History',
      contexts: ['action', 'browser_action'],
      parentId: 'options',
      type: 'checkbox',
      checked: prefs.disablehistory
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
  else if (menuItemId.startsWith('defaultTool')) {
    chrome.storage.local.set({
      'defaultTool': Number(menuItemId.slice(-1))
    });
  }
  else if (menuItemId.startsWith('sidebarViewOnLoad')) {
    chrome.storage.local.set({
      'sidebarViewOnLoad': Number(menuItemId.slice(-1))
    });
  }
  else if (menuItemId.startsWith('scrollModeOnLoad')) {
    chrome.storage.local.set({
      'scrollModeOnLoad': Number(menuItemId.slice(-1))
    });
  }
  else if (menuItemId.startsWith('externalLinkTarget')) {
    chrome.storage.local.set({
      'externalLinkTarget': Number(menuItemId.slice(-1))
    });
  }
  else if (menuItemId.startsWith('spreadModeOnLoad')) {
    chrome.storage.local.set({
      'spreadModeOnLoad': Number(menuItemId.slice(-1))
    });
  }
  else if (menuItemId.startsWith('defaultZoomValue')) {
    chrome.storage.local.set({
      'defaultZoomValue': menuItemId.split(':')[1]
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
