self.addEventListener('fetch', e => {
  if (e.request.url.endsWith('/data/pdf.js/web/viewer.css')) {
    const p = Promise.all([
      fetch(e.request).then(r => r.text()),
      fetch('/data/viewer/buttons.css').then(r => r.text()),
      fetch('/data/viewer/theme.css').then(r => r.text())
    ]).then(a => new Response(a.join('\n'), {
      'status': 200,
      'headers': {
        'content-type': 'text/css; charset=UTF-8'
      }
    }));
    e.respondWith(p);
  }
  else if (e.request.url.endsWith('/data/pdf.js/web/viewer.mjs')) {
    const p = Promise.all([
      fetch(e.request).then(r => r.text()),
      fetch('/data/viewer/overwrite.js').then(r => r.text())
    ]).then(a => new Response(a.join('\n'), {
      'status': 200,
      'headers': {
        'content-type': 'text/javascript; charset=UTF-8'
      }
    }));
    e.respondWith(p);
  }
  else {
    e.respondWith(fetch(e.request));
  }
});
self.addEventListener('activate', () => self.clients.claim());
self.addEventListener('install', () => self.skipWaiting());
