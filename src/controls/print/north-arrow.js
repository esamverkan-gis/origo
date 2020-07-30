import { Element as El } from '../../ui';

export default function NorthArrow(options = {}) {
  const {
    baseUrl,
    logo,
    map
  } = options;

  const viewer = map.getView();
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

  const calculateDegrees = (radians) => {
    const degrees = radians * (180 / Math.PI);
    return degrees;
  };

  const rotateLogo = (degrees) => {
    const target = document.getElementsByClassName('padding-right-small')[0];
    target.style.transform = `rotate(${degrees}deg)`;
  };

  const onRotationChanged = () => {
    const rotation = viewer.getRotation();
    const degrees = calculateDegrees(rotation);
    rotateLogo(degrees);
  };

  map.getView().on('change:rotation', onRotationChanged);


  return El({
    attributes: { src: `${baseUrl}${src}` },
    cls,
    tagName: 'img',
    style
  });
}
