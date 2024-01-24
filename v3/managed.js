/* update prefs from the managed storage */
{
  const once = () => chrome.storage.managed.get(null, rps => {
    if (chrome.runtime.lastError) {
      return;
    }
    if ('guid' in rps) {
      chrome.storage.local.get({
        guid: ''
      }, prefs => {
        if (prefs.guid !== rps.guid) {
          chrome.storage.local.set(rps, () => {
            console.info('Managed preferences are applied');
          });
        }
      });
    }
    else {
      if (Object.getOwnPropertyNames(rps).length) {
        console.info('Managed preferences are ignored. Please set "guid"');
      }
    }
  });

  chrome.runtime.onStartup.addListener(once);
  chrome.runtime.onInstalled.addListener(once);
}

