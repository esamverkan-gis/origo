
import GeoJSON from 'ol/format/GeoJSON';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Draw, { createRegularPolygon } from 'ol/interaction/Draw';
import Button from '../../../ui/button';
import GridControl from './gridtool-control';
import GridToolControl from './gridtool-control';

const GridToolMenu = function gridToolMenu(options = {}) {
  let {
    map,
    viewer,
    checked,
    // extent in minX, minY, maxX, maxY order
    bbox = [19.5, 64.8, 14.5, 61],
    cellside = 50,
    strokeColor = '#9B78BE',
    fillColor = 'rgba(270, 35, 61, 0)',
    units = 'kilometers'
  } = options;

  let gridcontrol;
  const source = new VectorSource({ wrapX: false });

  const vector = new VectorLayer({
    source
  });

  map.addLayer(vector);

  let draw;
  let gridtoolMenuContainer;
  let gridColorInput;
  let gridSizeOption;
  let gridUnitOption;

  const checkIcon = '#ic_check_circle_24px';
  const uncheckIcon = '#ic_radio_button_unchecked_24px';

  const addGridLayer = () => {
    strokeColor = gridColorInput.value;
    cellside = gridSizeOption.value;
    units = gridUnitOption.value;

    if (gridcontrol !== undefined) {
      gridcontrol.remove();
    }
    gridcontrol = new GridToolControl({
      // extent in minX, minY, maxX, maxY order
      bbox: [19.5, 64.8, 14.5, 61],
      cellside,
      strokeColor,
      fillColor: 'rgba(270, 35, 61, 0)',
      units
    }, map);
    gridcontrol.add();
  };

  function drawGridArea() {
    debugger;
    const geometryFunction = createRegularPolygon(4);
    draw = new Draw({
      snapTolerance: 1,
      source,
      type: 'Square',
      geometryFunction
    });
    map.addInteraction(draw);
  }

  const toggleGridLayerMenu = () => {
    gridColorInput = document.getElementById('printmap-gridtool-colorpicker');
    gridColorInput.onchange = function () {
      strokeColor = this.value;
    };
    gridSizeOption = document.getElementById('printmap-gridtool-gridsize-input');
    gridUnitOption = document.getElementById('printmap-gridtool-unit-options');
    const btn = document.getElementById('printmap-gridtool-draw-button');
    btn.addEventListener('click', drawGridArea);
    gridtoolMenuContainer = document.getElementById('printmap-gridtool-menu-container');
    if (checked) {
      gridtoolMenuContainer.style.display = 'block';
    } else {
      gridcontrol.remove();
      gridcontrol = undefined;
      gridtoolMenuContainer.style.display = 'none';
    }
  };

  map.on('dblclick', () => {
    debugger;
    if (draw !== undefined) {
      bbox = vector.getExtent();
      map.removeInteraction(draw);
      draw = undefined;
      addGridLayer();
    }
  });

  const getCheckIcon = (visible) => {
    const isVisible = visible ? checkIcon : uncheckIcon;
    return isVisible;
  };

  return Button({
    cls: 'round small icon-smaller no-shrink',
    click() {
      checked = !checked;
      this.setIcon(getCheckIcon(checked));
      this.dispatch('change:check', { checked });
      toggleGridLayerMenu();
    },
    style: {
      'align-self': 'center'
    },
    icon: getCheckIcon(checked)
  });
};

export default GridToolMenu;
