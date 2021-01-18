/* globals PDFViewerApplication */
'use strict';

const args = new URLSearchParams(location.search);
let title;

// prevent CROS error
delete URL.prototype.origin;

// favicon
try {
  const url = decodeURIComponent(location.search.split('file=')[1].split('&')[0]);
  const set = (href = 'chrome://favicon/' + url)=> {
    const link = document.querySelector('link[rel*="icon"]') || document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = href;
    document.head.appendChild(link);
  };

  const {hostname, protocol} = new URL(url);
  const favicon = protocol + '//' + hostname + '/favicon.ico';
  fetch(favicon).then(r => set(r.ok ? favicon : undefined), set());
}
catch (e) {}

const style = document.createElement('style');
chrome.storage.local.get({
  theme: 'dark-1',
  styles: ''
}, prefs => {
  document.documentElement.dataset.theme = prefs.theme;
  style.textContent = prefs.styles;
  document.documentElement.appendChild(style);
});
chrome.storage.onChanged.addListener(ps => {
  if (ps.theme) {
    document.documentElement.dataset.theme = ps.theme.newValue;
  }
  if (ps.styles) {
    style.textContent = ps.styles.newValue;
  }
});

document.addEventListener('DOMContentLoaded', () => {
  title = document.title;
  const parent = document.getElementById('toolbarViewerRight');
  const button = document.createElement('button');
  button.onclick = () => navigator.clipboard.writeText(args.get('file')).then(() => {
    document.title = 'Done!';
    setTimeout(() => {
      document.title = title;
    }, 1000);
  }).catch(e => alert(e.message));
  button.classList.add('toolbarButton', 'copyLink');
  const span = document.createElement('span');
  span.textContent = button.title = 'Copy PDF Link';
  button.appendChild(span);
  const openFile = document.getElementById('openFile');
  if (openFile) {
    parent.insertBefore(button, openFile);
  }
  else {
    parent.appendChild(button);
  }
});

// change page number
// document.addEventListener('webviewerloaded', () => {
//   const href = args.get('file');
//   PDFViewerApplication.initializedPromise.then(() => {
//     PDFViewerApplication.eventBus.on('pagesloaded', () => {
//       if (href.indexOf('#page=') !== -1) {
//         const page = href.split('#page=')[1].split('&')[0];
//         PDFViewerApplication.page = Number(page);
//       }
//     });
//   });
// });
