import GeoJSON from 'ol/format/GeoJSON';
import {Circle as CircleStyle, Fill, Stroke, Style} from 'ol/style';
import Button from '../../ui/button';

const gridToolControl = function GridToolControl(options = {}, viewer) {
  let {
    map,
    checked,
    projection = viewer.getProjection(),
    numberOfTiles,
    gridSize = 20
  } = options;

  const checkIcon = '#ic_check_circle_24px';
  const uncheckIcon = '#ic_radio_button_unchecked_24px';
  const getCheckIcon = (visible) => {
    const isVisible = visible ? checkIcon : uncheckIcon;
    return isVisible;
  };

  const createGrids = () => {
    // Get the bounds of the map.
    const bounds = viewer.getExtent();
    const width = Math.ceil((bounds.right - bounds.left) / gridSize);
    const height = Math.ceil((bounds.top - bounds.bottom) / gridSize);
    numberOfTiles = width * height;

    // Creates grids to cover the map.
    let grids = [];
    for(let i = 1; i<= numberOfTiles i++) {
      const grid = {
        'type': 'Feature',
        'geometry': {
          'type': 'MultiPolygon',
          'coordinates': [
            [[[-5e6, 6e6], [-5e6, 8e6], [-3e6, 8e6], [-3e6, 6e6]]],
          ]
        }
      }
    }
  };

  const toggleGridLayer = () => {
    viewer.getExtent();
   
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

};


export default gridToolControl;
