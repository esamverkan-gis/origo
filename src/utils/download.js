import { getPointResolution, get as getProjection } from 'ol/proj';
import olScaleLine from 'ol/control/ScaleLine';
import domtoimage from 'dom-to-image';
import LoadScript from './load-script';

const pdfLibUrl = 'https://unpkg.com/jspdf@latest/dist/jspdf.min.js';

const jsPDFLoader = LoadScript({
  src: pdfLibUrl,
  global: 'jsPDF'
});
let jsPDF;
let url;
let scaleWidth;
let scaleHeight;

const exportOptions = {
  filter(element) {
    const className = element.className || '';
    return (
      className.indexOf('ol-control') === -1
      || className.indexOf('ol-scale') > -1
      || (className.indexOf('ol-attribution') > -1
        && className.indexOf('ol-uncollapsible'))
    );
  }
};

export const loadJsPDF = async function loadJsPDF() {
  if (!jsPDF) { jsPDF = await jsPDFLoader.load(); }
};

export const downloadBlob = function downloadBlob({ blob, filename }) {
  return new Promise((resolve) => {
    const link = document.createElement('a');
    url = URL.createObjectURL(blob);

    // ie 11 workaround
    if (!('download' in link) && window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveOrOpenBlob(blob, filename);
      URL.revokeObjectURL(url);
      resolve();
      return;
    }

    if (!('download' in link)) {
      link.target = '_blank';
    }

    link.download = filename;
    link.href = url;

    const clickHandler = () => {
      window.setTimeout(() => {
        URL.revokeObjectURL(url);
        link.removeEventListener('click', clickHandler, false);
        resolve();
      }, 200);
    };
    link.addEventListener('click', clickHandler);
    link.click();
  });
};


const mm2Pt = function convertMm2Pt(mm) {
  const factor = 2.8346456692913;
  return mm * factor;
};


export const setScaleResolution = (map, resolution, scale, size) => {
  const dim = size;
  scaleWidth = Math.round((dim[0] * resolution) / 25.4);
  scaleHeight = Math.round((dim[1] * resolution) / 25.4);
  const scaleResolution = scale
    / getPointResolution(
      map.getView().getProjection(),
      resolution / 25.4,
      map.getView().getCenter()
    );
  return scaleResolution;
};

export const createImg = async function createImg(el, map, type, filename, format, orientation) {
  const viewResolution = map.getView().getResolution();
  const scale = '10000';
  const scaleResolution = setScaleResolution(map, viewResolution, scale, format);
  const controls = map.getControls().getArray();
  let scaleLine;
  controls.forEach((control) => {
    if (control instanceof olScaleLine) {
      scaleLine = control;
    }
  });
  scaleLine.setDpi(scaleResolution);
  map.getTargetElement().style.width = `${scaleWidth}px`;
  map.getTargetElement().style.height = `${scaleHeight}px`;
  map.updateSize();
  map.getView().setResolution(scaleResolution);
  domtoimage.toPng(el, exportOptions)
    .then((dataUrl) => {
      debugger;
      switch (type) {
        case 'png':
          const link = document.createElement('a');
          link.download = filename;
          link.href = dataUrl;
          link.click();
          break;
        case 'pdf':
          const pdf = new jsPDF({ orientation, format, unit: 'mm' });
          pdf.addImage(dataUrl, 'PNG', 0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight());
          pdf.save(`${filename}.pdf`);
          break;
        default:
          return false;
      }
      // Reset original map size
      scaleLine.setDpi();
      map.getTargetElement().style.width = '';
      map.getTargetElement().style.height = '';
      map.updateSize();
      map.getView().setResolution(viewResolution);
      document.body.style.cursor = 'auto';
    })
    .catch((error) => {
      console.error('oops, something went wrong!', error);
    });

  // domtoimage.toPng(map.getViewport(), exportOptions);
};


// New function to download pdf file
export const downloadPDF = async function downloadPDF({
  afterRender,
  beforeRender,
  map,
  el,
  filename,
  height,
  orientation,
  size,
  width,
  dpi
}) {
  await loadJsPDF();
  debugger;
  const format = size === 'custom' ? [mm2Pt(width), mm2Pt(height)] : size;
  const pdf = new jsPDF({ orientation, format, unit: 'mm' });
  if (beforeRender) beforeRender(el);
  exportOptions.width = width;
  exportOptions.height = height;
  const canvas = await createImg(el, map, filename, format);
  if (afterRender) afterRender(el);
  pdf.addImage(canvas, 'PNG', 0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight());
  pdf.save(`${filename}.pdf`);
};


export const download = async function download({
  afterRender,
  beforeRender,
  el,
  map,
  type,
  filename,
  height,
  orientation,
  size,
  width,
  dpi
}) {
  await loadJsPDF();
  debugger;
  const format = size === 'custom' ? [mm2Pt(width), mm2Pt(height)] : size;
  if (beforeRender) beforeRender(el);
  exportOptions.width = width;
  exportOptions.height = height;
  if (afterRender) afterRender(el);
  await createImg(el, map, 'png', filename, format);
};

/*
export const downloadPDF = async function downloadPDF({
  afterRender,
  beforeRender,
  el,
  filename,
  height,
  orientation,
  size,
  width,
  dpi
}) {
  await loadJsPDF();
  const format = size === 'custom' ? [mm2Pt(width), mm2Pt(height)] : size;
  const pdf = new jsPDF({ orientation, format, unit: 'mm' });
  if (beforeRender) beforeRender(el);
  const canvas = await html2canvas(el, dpi);
  if (afterRender) afterRender(el);
  pdf.addImage(canvas, 'PNG', 0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight());
  pdf.save(`${filename}.pdf`);
};
*/
