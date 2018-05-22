'use strict';

// prevent CROS error
window.URL = false;

// favicon
try {
  const link = document.querySelector("link[rel*='icon']") || document.createElement('link');
  link.type = 'image/x-icon';
  link.rel = 'shortcut icon';
  link.href = 'chrome://favicon/' +
    decodeURIComponent(location.search.split('file=')[1].split('&')[0]);
  document.getElementsByTagName('head')[0].appendChild(link);
}
catch (e) {}
