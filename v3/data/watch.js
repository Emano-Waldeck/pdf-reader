const type = document.contentType || '';

const redirect = () => {
  // allow opening with default PDF viewer
  if (location.search.includes('native-view')) {
    return;
  }
  const next = () => {
    const args = new URLSearchParams();
    args.set('file', location.href.split('#')[0]);
    const viewer = chrome.runtime.getURL('/data/pdf.js/web/viewer.html') + '?' + args.toString() + location.hash;

    if (window.top === window) {
      chrome.runtime.sendMessage({
        method: 'open-viewer',
        viewer
      });
    }
    else {
      location.replace(viewer);
    }
  };

  if (window === window.top) {
    next();
  }
  else {
    chrome.storage.local.get({
      frames: false
    }, prefs => {
      if (prefs.frames) {
        next();
      }
    });
  }
};

if (type === 'application/pdf') {
  redirect();
}
else if (type === 'application/octet-stream') {
  if (location.href.toLowerCase().includes('.pdf')) {
    redirect();
  }
}
