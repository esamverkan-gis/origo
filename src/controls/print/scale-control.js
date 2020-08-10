import Button from '../../ui/button';
import mapUtils from '../../maputils';
import numberFormatter from '../../utils/numberformatter';

export default function ScaleControl(options = {}) {
  let {
    checked,
    map,
    viewer
  } = options;

  let mapScale = '';
  let projection;
  const resolutions = viewer.getResolutions();

  const checkIcon = '#ic_check_circle_24px';
  const uncheckIcon = '#ic_radio_button_unchecked_24px';

  const getCheckIcon = (visible) => {
    const isVisible = visible ? checkIcon : uncheckIcon;
    return isVisible;
  };

  const roundScale = (scale) => {
    const diff = scale % 10;
    const scaleValue = diff !== 0 ? scale += (10 - diff) : scale;
    return scaleValue;
  };

  const getCurrentMapScale = () => {
    const currentScale = roundScale(mapUtils.resolutionToScale(map.getView().getResolution(), projection));
    // return currentScale >= mapscaleLimit ? currentScale : mapscaleLimit;
    return currentScale;
  };

  const onZoomChange = () => {
    try {
      const scaleText = document.getElementsByClassName('o-print-scaletext')[0];
      const currentMapScale = numberFormatter(getCurrentMapScale());
      document.getElementsByClassName('o-print-scaletext')[0].value = getCurrentMapScale();
      mapScale = `1:${currentMapScale}`;
      if (checked) {
        scaleText.textContent = mapScale;
      }
    } catch (e) {
      console.log();
    }
    return mapScale;
  };


  projection = map.getView().getProjection();
  map.getView().on('change:resolution', onZoomChange);
  return Button({
    cls: 'round small icon-smaller no-shrink',
    click() {
      checked = !checked;
      this.setIcon(getCheckIcon(checked));
      this.dispatch('change:check', { checked });
      if (checked) {
        onZoomChange();
      }
    },
    style: {
      'align-self': 'center'
    },
    icon: getCheckIcon(checked)
  });
}
