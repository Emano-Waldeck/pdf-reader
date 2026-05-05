const toast = document.getElementById('toast');

document.getElementById('save').addEventListener('click', () => chrome.storage.local.set({
  styles: document.getElementById('styles').value,
  saveas: document.getElementById('saveas').value === 'save-as'
}, () => {
  toast.textContent = 'Options Saved';
  setTimeout(() => toast.textContent = '', 1000);
}));

chrome.storage.local.get({
  styles: '',
  saveas: false
}, prefs => {
  document.getElementById('styles').value = prefs.styles;
  document.getElementById('saveas').value = prefs.saveas ? 'save-as' : 'save';
});

// reset
document.getElementById('reset').addEventListener('click', e => {
  if (e.detail === 1) {
    toast.textContent = 'Double-click to reset!';
    window.setTimeout(() => toast.textContent = '', 750);
  }
  else {
    localStorage.clear();
    chrome.storage.local.clear(() => {
      chrome.runtime.reload();
      window.close();
    });
  }
});
// support
document.getElementById('support').addEventListener('click', () => chrome.tabs.create({
  url: chrome.runtime.getManifest().homepage_url + '?rd=donate'
}));
