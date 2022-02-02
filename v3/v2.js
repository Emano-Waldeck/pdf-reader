chrome.action = chrome.action || chrome.browserAction;

chrome.scripting = chrome.scripting || {
  executeScript({target, files, func, args = []}) {
    const props = {};

    if (files) {
      props.file = files[0];
    }
    if (func) {
      const s = btoa(JSON.stringify(args));
      props.code = '(' + func.toString() + `)(...JSON.parse(atob('${s}')))`;
    }
    if (target.allFrames) {
      props.allFrames = true;
      props.matchAboutBlank = true;
    }
    if (target.frameIds) {
      props.frameId = target.frameIds[0];
    }

    return new Promise((resolve, reject) => chrome.tabs.executeScript(target.tabId, props, r => {
      const lastError = chrome.runtime.lastError;
      if (lastError) {
        reject(lastError);
      }
      else {
        resolve(r.map(result => ({result})));
      }
    }));
  }
};

navigator.serviceWorker.register('overwrite.js');
