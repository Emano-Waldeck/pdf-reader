/* global PDFViewerApplication */
'use strict';

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

// worker requests
navigator.serviceWorker.addEventListener('message', e => {
  if (e.data.method === 'open-file') {
    const reader = new FileReader();
    reader.onload = () => {
      PDFViewerApplication.open(new Uint8Array(reader.result));
    };
    reader.readAsArrayBuffer(e.data.file);
  }
});
