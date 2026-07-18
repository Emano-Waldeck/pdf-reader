/* global PDFViewerApplication */

document.addEventListener('DOMContentLoaded', async () => {
  const div = document.createElement('div');
  div.classList.add('toolbarButtonWithContainer');
  const button = document.createElement('button');
  button.classList.add('toolbarButton', 'hiddenMediumView', 'themeButton');
  const span = document.createElement('span');
  span.textContent = button.title = `Change color theme of the PDF reader (experimental)`;
  button.appendChild(span);
  div.appendChild(button);

  const popup = document.createElement('div');
  popup.classList.add('themeSelectorToolbar', 'doorHangerRight', 'hidden');
  const select = document.createElement('select');
  popup.appendChild(select);
  div.appendChild(popup);

  const actions = {
    show() {
      // hide any open popups
      document.querySelector('#editorModeButtons .toggled')?.dispatchEvent(new Event('click'));

      popup.classList.remove('hidden');
      popup.classList.add('toggled');
    },
    hide() {
      popup.classList.add('hidden');
      popup.classList.remove('toggled');
    }
  };
  // hide when not clicked
  addEventListener('click', e => {
    if (div.contains(e?.target) || e?.target === popup) {
      return;
    }
    actions.hide();
  });

  button.onclick = e => {
    if (popup.classList.contains('toggled')) {
      actions.hide();
    }
    else {
      actions.show();
    }
  };

  document.querySelector('.toolbar #editorStamp').after(div);
  const prefs = await chrome.storage.local.get({
    'page-theme': 'Native|System'
  });

  let api;
  const themes = await fetch('/data/viewer/page-theme/colors.json').then(r => r.json());
  const changeTheme = async name => {
    if (typeof api === 'undefined') {
      api = await import('./api.js');
      await api.init(themes);

      // addEventListener('beforeprint', api.disable);
      // addEventListener('afterprint', () => {
      //   if (changeTheme.theme) {
      //     api.enable();
      //     PDFViewerApplication.pdfViewer.refresh();
      //   }
      // });
    }
    if (name === 'Native|System') {
      api.disable();
      changeTheme.theme = '';
    }
    else {
      const [scheme, tone] = name.split('|');
      for (let n = 0; n < themes.length; n += 1) {
        if (themes[n].name === scheme) {
          for (let m = 0; m < themes[n].tones.length; m += 1) {
            if (themes[n].tones[m].name === tone) {
              api.setTheme([n, m]);
              changeTheme.theme = name;

              api.enable();
              break;
            }
          }
          break;
        }
      }
    }

    PDFViewerApplication.pdfViewer.refresh();
  };

  if (prefs['page-theme'] !== 'Native|System') {
    changeTheme(prefs['page-theme']);
  }

  for (const theme of [{name: 'Native', tones: [{name: 'System'}]}, ...themes]) {
    for (const tone of theme.tones) {
      const option = document.createElement('option');
      option.textContent = theme.name + ' - ' + tone.name + ' Style';
      option.value = theme.name + '|' + tone.name;
      option.selected = option.value === prefs['page-theme'];
      select.appendChild(option);
    }
  }

  select.onchange = e => {
    changeTheme(e.target.value);
    // actions.hide();
    chrome.storage.local.set({
      'page-theme': e.target.value
    });
  };
});
