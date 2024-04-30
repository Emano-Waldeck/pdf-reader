/* global PDFViewerApplication, PDFViewerApplicationOptions */
'use strict';

// e.g. AcroForm
// https://campustecnologicoalgeciras.es/wp-content/uploads/2017/07/OoPdfFormExample.pdf#page=1
// https://kbdeveloper.qoppa.com/wp-content/uploads/blank_signed.pdf#page=1
// e.g. page number
// http://www.africau.edu/images/default/sample.pdf#page=2
// e.g. embedded PDF
// https://www.w3docs.com/tools/code-editor/1087
// e.g. automatic printing
// https://github.com/Emano-Waldeck/pdf-reader/files/5836703/Module.3.-.PPT.pdf
// scripting
// https://www.pdfscripting.com/public/FreeStuff/PDFSamples/PDFS_CopyPastListEntries.pdf#page=1
// https://www.pdfscripting.com/public/FreeStuff/PDFSamples/SimpleFormCalculations.pdf#page=1
// signature
// https://www.tecxoft.com/samples/sample01.pdf#page=1
// form
// http://foersom.com/net/HowTo/data/OoPdfFormExample.pdf#page=1
// embed
// https://pdfobject.com/examples/embed-multiple-PDFs.html

let title;
let href = '';

const favicon = href => {
  if (href && href.startsWith('http')) {
    {
      const link = document.querySelector('link[rel*="icon"]') || document.createElement('link');
      link.type = 'image/png';
      link.rel = 'shortcut icon';
      link.href = `chrome-extension://${chrome.runtime.id}/_favicon/?pageUrl=${encodeURIComponent(href)}&size=32`;
      document.head.appendChild(link);
    }
    // backup plan
    const {hostname, protocol} = new URL(href);
    if (protocol.startsWith('http')) {
      const link = document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'shortcut icon';
      link.href = protocol + '//' + hostname + '/favicon.ico';
      document.head.appendChild(link);
    }
  }
};

document.addEventListener('webviewerloaded', function() {
  PDFViewerApplication.open = new Proxy(PDFViewerApplication.open, {
    apply(target, self, args) {
      href = args[0]?.url || '';
      history.replaceState('', '', '/data/pdf.js/web/viewer.html?file=' + href);
      try {
        favicon(href.split('#')[0]);
      }
      catch (e) {
        console.error('favicon', e);
      }
      try {
        const defaultViewer = document.querySelector('.defaultViewer');
        if (defaultViewer) {
          defaultViewer.disabled = !href || href.startsWith('/data/') || href.startsWith('blob:');
        }
        const copyLink = document.querySelector('.copyLink');
        if (copyLink) {
          copyLink.disabled = !href || href.startsWith('/data/') || href.startsWith('blob:');
        }
      }
      catch (e) {
        console.error('disabling buttons', e);
      }
      return Reflect.apply(target, self, args);
    }
  });
});

// prevent CROS error
delete URL.prototype.origin;

// theme
const style = document.createElement('style');
chrome.storage.local.get({
  theme: 'os-theme',
  styles: ''
}, prefs => {
  if (prefs.theme === 'os-theme') {
    prefs.theme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark-1' : 'light-1';
  }
  document.documentElement.dataset.theme = prefs.theme;
  style.textContent = prefs.styles;
  document.documentElement.appendChild(style);
});
chrome.storage.onChanged.addListener(ps => {
  if (ps.theme) {
    let v = ps.theme.newValue;
    if (v === 'os-theme') {
      v = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark-1' : 'light-1';
    }
    document.documentElement.dataset.theme = v;
  }
  if (ps.styles) {
    style.textContent = ps.styles.newValue;
  }
});
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
  chrome.storage.local.get({
    theme: 'os-theme'
  }, prefs => {
    if (prefs.theme === 'os-theme') {
      document.documentElement.dataset.theme = event.matches ? 'dark-1' : 'light-1';
    }
  });
});

const hash = () => {
  const e = document.getElementById('viewBookmark')?.getAttribute('href');
  if (e) {
    return e;
  }
  else if (PDFViewerApplication.page) {
    return '#page=' + PDFViewerApplication.page;
  }
  return '';
};
const copy = content => navigator.clipboard.writeText(content).then(() => {
  document.title = 'Copied to the Clipboard!';
  setTimeout(() => {
    document.title = title;
  }, 1000);
}).catch(e => {
  // inside iframe
  const storage = document.createElement('textarea');
  storage.value = content;
  document.documentElement.appendChild(storage);

  storage.select();
  const r = document.execCommand('copy');
  storage.remove();

  if (!r) {
    console.error(e);
    alert(e.message);
  }
});

// copy link
document.addEventListener('DOMContentLoaded', () => {
  title = document.title;
  const parent = document.getElementById('toolbarViewerRight');
  const button = document.createElement('button');
  button.onclick = () => {
    copy(href + hash());
  };
  button.classList.add('toolbarButton', 'hiddenMediumView', 'copyLink');
  // disable default view on unsupported formats
  if (href) {
    if (href.startsWith('/data/') || href.startsWith('blob:')) {
      button.disabled = true;
    }
  }

  const span = document.createElement('span');
  span.textContent = button.title = `Copy Current Page's Link`;
  button.appendChild(span);
  const print = document.getElementById('print');
  if (print) {
    parent.insertBefore(button, print);
  }
  else {
    parent.appendChild(button);
  }
});
// bookmark
document.addEventListener('DOMContentLoaded', () => {
  const b = document.getElementById('viewBookmark');
  b.addEventListener('click', e => {
    copy(href + hash());
  });
});

// custom zoom
document.addEventListener('DOMContentLoaded', () => {
  const parent = document.getElementById('toolbarViewerMiddle');
  const button = document.createElement('button');
  button.classList.add('toolbarButton', 'customZoom');
  const span = document.createElement('span');
  span.textContent = button.title = 'Enter custom zooming level (Ctrl/Command + Shift + Z)';
  button.appendChild(span);
  button.onclick = () => {
    const n = PDFViewerApplication.pdfViewer.currentScaleValue * 100;
    const v = prompt('Enter custom zoom percent', isNaN(n) ? 100 : n) || '';
    if (v && isNaN(v) === false) {
      PDFViewerApplication.pdfViewer.currentScaleValue = Number(v.replace('%', '')) / 100;
    }
  };
  parent.appendChild(button);
});

// default viewer
document.addEventListener('DOMContentLoaded', () => {
  const parent = document.getElementById('toolbarViewerRight');
  const button = document.createElement('button');
  button.classList.add('toolbarButton', 'hiddenMediumView', 'defaultViewer');
  const span = document.createElement('span');
  span.textContent = button.title = 'Reopen with the default PDF viewer (Ctrl/Command + Shift + D)';
  button.appendChild(span);
  button.onclick = () => {
    let c = href.split('#')[0];
    c += (c.includes('?') ? '&' : '?') + 'native-view';
    c += hash();

    location.replace(c);
  };
  // disable default view on unsupported formats
  if (href) {
    if (href.startsWith('/data/') || href.startsWith('blob:')) {
      button.disabled = true;
    }
  }

  const print = document.getElementById('print');
  if (print) {
    parent.insertBefore(button, print);
  }
  else {
    parent.appendChild(button);
  }
});

// shortcut handling
document.addEventListener('keydown', e => {
  const meta = e.metaKey || e.ctrlKey;
  if (meta && e.shiftKey && e.code === 'KeyD') {
    e.stopPropagation();
    e.preventDefault();
    document.querySelector('button.defaultViewer').click();
  }
  else if (meta && e.shiftKey && e.code === 'KeyZ') {
    e.stopPropagation();
    e.preventDefault();
    document.querySelector('button.customZoom').click();
  }
});

// preferences
document.addEventListener('webviewerloaded', function() {
  const _initializeViewerComponents = PDFViewerApplication._initializeViewerComponents;
  PDFViewerApplication._initializeViewerComponents = async function(...args) {
    const prefs = await new Promise(resolve => chrome.storage.local.get({
      'enableScripting': true,
      'disablePageLabels': false,
      'enablePermissions': false,
      'enablePrintAutoRotate': false,
      'enableWebGL': false,
      'historyUpdateUrl': true,
      'ignoreDestinationZoom': false,
      'pdfBugEnabled': false,
      'renderInteractiveForms': true,
      'useOnlyCssZoom': false,
      'disableAutoFetch': false,
      'disableFontFace': false,
      'disableRange': false,
      'disableStream': false,
      'annotationMode': 2
    }, resolve));

    PDFViewerApplicationOptions.set('annotationMode', prefs.annotationMode);
    PDFViewerApplicationOptions.set('enableScripting', prefs.enableScripting);
    delete prefs['enableScripting'];
    delete prefs['renderInteractiveForms'];

    const r = _initializeViewerComponents.apply(this, args);
    const {pdfViewer} = this;

    for (const [key, value] of Object.entries(prefs)) {
      pdfViewer[key] = value;
    }

    return r;
    // console.log(PDFViewerApplication);
    // console.log(PDFViewerApplicationOptions);
  };
});

// try to handle PDF errors (download error for instance)
addEventListener('unhandledrejection', e => {
  if (e && e.reason) {
    // if (e.reason.name === 'InvalidPDFException') {
    console.error('PDF Error', e);
    document.title = '[Error] ' + document.title;
    alert(e.reason.message);
    // }
  }
});

// explorer
if ('launchQueue' in window && 'files' in LaunchParams.prototype) {
  launchQueue.setConsumer(async launchParams => {
    // Nothing to do when the queue is empty.
    if (!launchParams.files.length) {
      return;
    }
    for (const fileHandle of launchParams.files) {
      const file = await fileHandle.getFile();
      if (file.type === 'application/pdf') {
        const r = new Response(file);
        const url = URL.createObjectURL(await r.blob());
        await PDFViewerApplication.open({
          url,
          filename: file.name
        });
        document.title = file.name;
        return;
      }
      else {
        console.error('this file format is not supported', file.type, file);
      }
    }
  });
}

