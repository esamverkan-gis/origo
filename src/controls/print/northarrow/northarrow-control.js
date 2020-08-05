import Button from '../../../ui/button';

export default function CreatedControl(options = {}) {
  let {
    checked,
    map
  } = options;

  const viewer = map.getView();

  const checkIcon = '#ic_check_circle_24px';
  const uncheckIcon = '#ic_radio_button_unchecked_24px';


  const calculateDegrees = (radians) => {
    const degrees = radians * (180 / Math.PI);
    return degrees;
  };

  const rotateLogo = (degrees) => {
    const target = document.getElementsByClassName('padding-right-small')[0];
    if (target !== undefined) {
      target.style.transform = `rotate(${degrees}deg)`;
    }
  };

  const onRotationChanged = () => {
    debugger;
    const rotation = viewer.getRotation();
    const degrees = calculateDegrees(rotation);
    rotateLogo(degrees);
  };

  map.on('render', () => onRotationChanged);
  // map.getView().on('change:rotation', onRotationChanged);

  const setVisible = (display) => {
    try {
      if (!display) {
        document.getElementsByClassName('printmap-north-arrow')[0].style.display = 'none';
        map.getView.un('change:resolution', onRotationChanged);
      } else {
        document.getElementsByClassName('printmap-north-arrow')[0].style.display = 'block';
        map.getView().on('change:rotation', onRotationChanged);
        onRotationChanged();
      }
    } catch (e) {
      console.log();
    }
  };


  const getCheckIcon = (visible) => {
    const isVisible = visible ? checkIcon : uncheckIcon;
    setVisible(checked);
    return isVisible;
  };

  return Button({
    cls: 'round small icon-smaller no-shrink',
    click() {
      checked = !checked;
      this.setIcon(getCheckIcon(checked));
      this.dispatch('change:check', { checked });
    },
    style: {
      'align-self': 'center'
    },
    icon: getCheckIcon(checked)
  });
}
