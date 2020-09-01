import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import proj4 from 'proj4';
import Draw, { createBox } from 'ol/interaction/Draw';
import Button from '../../../ui/button';
import GridToolControl from './gridtool-control';

const GridToolMenu = function gridToolMenu(options = {}) {
  let {
    map,
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
      bbox,
      cellside,
      strokeColor,
      fillColor: 'rgba(270, 35, 61, 0)',
      units
    }, map);
    gridcontrol.add();
  };


  function drawGridArea() {
    const geometryFunction = createBox();
    draw = new Draw({
      snapTolerance: 1,
      source,
      type: 'Circle',
      geometryFunction
    });
    map.addInteraction(draw);
    draw.once('drawend', () => {
      if (draw !== undefined) {
        draw.finishDrawing();
        debugger;
        // eslint-disable-next-line no-underscore-dangle
        const coords = draw.sketchCoords_.flat().sort();
        const sw = proj4(proj4.defs('EPSG:3857'), proj4.defs('EPSG:4326'), [coords[0], coords[3]]);
        const ne = proj4(proj4.defs('EPSG:3857'), proj4.defs('EPSG:4326'), [coords[1], coords[2]]);
        bbox = [sw[0], sw[1], ne[0], ne[1]];
        map.removeInteraction(draw);
        draw = undefined;
        addGridLayer();
      }
    });
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
