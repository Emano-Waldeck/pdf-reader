/* global PDFViewerApplication */

document.addEventListener('DOMContentLoaded', () => {
  function parseNumberRange(str) {
    const result = [];

    str.split(',').forEach(part => {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(Number);
        if (isNaN(start) || isNaN(end)) {
          throw Error('Start or end is not a number');
        }
        if (end < start) {
          throw Error('Start of a range must be smaller than end');
        }
        if (start < 1 || end < 1) {
          throw Error('Each page must be a number >= 1');
        }
        for (let i = start; i <= end; i++) {
          result.push(i);
        }
      }
      else {
        const num = Number(part);
        if (isNaN(num)) {
          throw Error('page must be a number');
        }
        if (num < 1) {
          throw Error('Each page must be a number >= 1');
        }

        if (!isNaN(num)) {
          result.push(num);
        }
      }
    });

    return result;
  }

  const button = document.createElement('button');
  button.onclick = async e => {
    // const t = PDFViewerApplication.pagesCount;
    const p = prompt(
      'Specify page numbers in this format: start-end or comma-separated (e.g., 1,2,5-7,10).',
      PDFViewerApplication.page + '-' + PDFViewerApplication.page
    );
    if (!p) {
      return;
    }

    const pageIndexes = parseNumberRange(p);
    if (pageIndexes.some(n => n > PDFViewerApplication.pagesCount)) {
      throw Error('Page numbers must be smaller than PDF size');
    }

    const {PDFDocument} = await import('/data/pdf-lib/pdf-lib.esm.js');

    const ab = await PDFViewerApplication.pdfDocument[e.shiftKey ? 'getData' : 'saveDocument']();
    const sourcePdf = await PDFDocument.load(ab.buffer, {
      ignoreEncryption: true
    });
    const newPdf = await PDFDocument.create();

    // zero-based
    const copiedPages = await newPdf.copyPages(sourcePdf, pageIndexes.map(n => n - 1));

    for (const page of copiedPages) {
      newPdf.addPage(page);
    }

    const newPdfBytes = await newPdf.save();

    const blob = new Blob([newPdfBytes], {
      type: 'application/pdf'
    });
    const url = URL.createObjectURL(blob);

    // open next to the current tab
    const [atb] = await chrome.tabs.query({
      active: true,
      lastFocusedWindow: true
    });

    const args = new URLSearchParams();
    args.set('file', url);
    args.set('name', '[reduced] ' + document.title);

    chrome.tabs.create({
      url: '/data/pdf.js/web/viewer.html?' + args.toString(),
      index: atb.index + 1
    });
  };
  button.classList.add('toolbarButton', 'hiddenMediumView', 'cutButton');

  const span = document.createElement('span');
  span.textContent = button.title = `Extract pages from this PDF file and open it as a new PDF file (Ctrl/Command + Shift + C)

Use shift key to ignore modifications`;
  button.appendChild(span);
  document.querySelector('.toolbar #editorStamp').after(button);
});
