import GeoJSON from 'ol/format/GeoJSON';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import * as ol from 'ol/style';
import * as projection from '@turf/projection';
import squaregrid from '@turf/square-grid';
import Button from '../../ui/button';

const GridToolControl = function gridToolControl(options = {}) {
  let {
    map,
    viewer,
    checked,
    // extent in minX, minY, maxX, maxY order
    bbox = [19.5, 64.8, 14.5, 61],
    cellside = 10,
    strokeColor = '#9B78BE',
    fillColor = 'rgba(270, 35, 61, 0)',
    units = 'kilometers'
  } = options;

  let gridLayer;

  const style = new ol.Style({
    stroke: new ol.Stroke({
      color: strokeColor,
      width: 2
    }),
    fill: new ol.Fill({
      color: fillColor
    }),
    text: new ol.Text({
      font: '10px Calibri,sans-serif',
      fill: new ol.Fill({
        color: '#000'
      })
    })
  });


  const checkIcon = '#ic_check_circle_24px';
  const uncheckIcon = '#ic_radio_button_unchecked_24px';

  const getCheckIcon = (visible) => {
    const isVisible = visible ? checkIcon : uncheckIcon;
    return isVisible;
  };

  // Gets the number of grids in height and width.
  const getExpanse = (layer) => {
    const width = '';
    const height = '';
    const expanse = { width, height };
    return expanse;
  };

  const createGridLayer = () => {
    const squareGrids = squaregrid(bbox, cellside, { units });
    const projected = projection.toMercator(squareGrids);
    const expanse = getExpanse(projected);
    Object.values(projected.features).forEach(feature => {
      feature.properties.label = 'A';
    });
    return projected;
  };

  const toggleGridLayer = () => {
    if (checked) {
      const squareGrid = createGridLayer();

      const source = new VectorSource({
        features: new GeoJSON().readFeatures(squareGrid)
      });

      debugger;
      gridLayer = new VectorLayer({
        source,
        style(feature) {
          const label = feature.get('label');
          style.getText().setText(label);
          return style;
        },
        removable: true,
        declutter: true
      });
      map.addLayer(gridLayer);
    } else {
      map.removeLayer(gridLayer);
    }
  };

  return Button({
    cls: 'round small icon-smaller no-shrink',
    click() {
      checked = !checked;
      this.setIcon(getCheckIcon(checked));
      this.dispatch('change:check', { checked });
      toggleGridLayer();
    },
    style: {
      'align-self': 'center'
    },
    icon: getCheckIcon(checked)
  });
};


export default GridToolControl;
