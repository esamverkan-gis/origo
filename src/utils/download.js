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
let scaleLine;

const exportOptions = {

};

export const loadJsPDF = async function loadJsPDF() {
  if (!jsPDF) { jsPDF = await jsPDFLoader.load(); }
};


const mm2Pt = function convertMm2Pt(mm) {
  const factor = 2.8346456692913;
  return mm * factor;
};


export const setScaleResolution = (map, resolution, scale) => {
  scaleWidth = Math.round((scaleWidth * resolution) / 25.4);
  scaleHeight = Math.round((scaleHeight * resolution) / 25.4);
  const scaleResolution = scale
    / getPointResolution(
      map.getView().getProjection(),
      resolution / 25.4,
      map.getView().getCenter()
    );
  return scaleResolution;
};

export const createImg = async function createImg(el, map, type, filename, format, orientation, scaleResolution) {
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
  const canvas = await createImg(el, map, filename, format, dpi);
  if (afterRender) afterRender(el);
  pdf.addImage(canvas, 'PNG', 0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight());
  pdf.save(`${filename}.pdf`);
};


export const download = async function download({
  afterRender,
  beforeRender,
  el,
  map,
  type = 'pdf',
  filename,
  height,
  orientation,
  size,
  width,
  dpi
}) {
  // await loadJsPDF();
  document.body.style.cursor = 'progress';
  debugger;
  const format = size === 'custom' ? [mm2Pt(width), mm2Pt(height)] : size;

  const viewResolution = map.getView().getResolution();
  const scale = (document.getElementsByClassName('o-print-scaletext')[0].value / 1000);
  const scaleResolution = setScaleResolution(map, dpi, scale);
  const controls = map.getControls().getArray();
  controls.forEach((control) => {
    if (control instanceof olScaleLine) {
      scaleLine = control;
    }
  });

  map.once('rendercomplete', () => {
    debugger;
    if (beforeRender) beforeRender(el);
    scaleWidth = width;
    scaleHeight = height;
    if (afterRender) afterRender(el);
    createImg(el, map, type, filename, format, orientation, scaleResolution);
    // Reset original map size
    scaleLine.setDpi();
    map.getTargetElement().style.width = '';
    map.getTargetElement().style.height = '';
    map.updateSize();
    map.getView().setResolution(viewResolution);
    document.body.style.cursor = 'auto';
  });
};
