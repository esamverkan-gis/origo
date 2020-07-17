import { Element as El } from '../../ui';

export default function NorthArrow(options = {}) {
  const {
    baseUrl,
    logo
  } = options;
  let {
    cls = 'padding-right-small',
    src = 'css/png/north_arrow_print.png',
    style = {
      height: '5rem'
    }
  } = options;
  if ('cls' in logo) {
    cls = logo.cls;
  }
  if ('src' in logo) {
    src = logo.src;
  }
  if ('style' in logo) {
    style = logo.style;
  }

  return El({
    attributes: { src: `${baseUrl}${src}` },
    cls,
    tagName: 'img',
    style
  });
}
