/* global PDFViewerApplication */

document.addEventListener('DOMContentLoaded', () => {
  const button = document.createElement('button');
  button.onclick = e => import('./inject.mjs').then(o => {
    o.post(request => {
      if (request) {
        print(request, e);
      }
    });
    o.guide.install();
    o.capture.install();
    o.monitor.install();
  });

  const print = async (request, e) => {
    const {PDFDocument} = await import('/data/pdf-lib/pdf-lib.esm.js');

    const ab = await PDFViewerApplication.pdfDocument[e.shiftKey ? 'getData' : 'saveDocument']();
    const sourcePDF = await PDFDocument.load(ab.buffer, {
      ignoreEncryption: true
    });
    const newPDF = await PDFDocument.create();

    const n = PDFViewerApplication.page;

    // zero-based
    const [copy] = await newPDF.copyPages(sourcePDF, [n - 1]);

    // convert request to PDF coordinates
    const page = await PDFViewerApplication.pdfDocument.getPage(n);
    const viewport = page.getViewport({scale: 1});
    const rect = PDFViewerApplication.pdfViewer.getPageView(n - 1).canvas.getBoundingClientRect();
    const x = request.left - rect.x;
    const y = request.top + request.height - rect.y;

    // scaling
    const ys = rect.height / viewport.viewBox[3];
    const xs = rect.width / viewport.viewBox[2];

    copy.setCropBox(
      ...viewport.convertToPdfPoint(x / xs, y / ys), // left, bottom
      request.width / xs, request.height / ys // width, height
    );
    newPDF.addPage(copy);

    const blob = new Blob([await newPDF.save()], {
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
    args.set('name', '[cropped] ' + document.title);

    chrome.tabs.create({
      url: '/data/pdf.js/web/viewer.html?' + args.toString(),
      index: atb.index + 1
    });
  };
  button.classList.add('toolbarButton', 'hiddenMediumView', 'cropButton');

  const span = document.createElement('span');
  span.textContent = button.title = `Crop current page and open it as a separate PDF file (Ctrl/Command + Shift + R)

Use shift key to ignore PDF modifications`;
  button.appendChild(span);
  document.querySelector('.toolbar #editorStamp').after(button);
});
