import GeoJSON from 'ol/format/GeoJSON';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style';
import squaregrid from '@turf/square-grid';
import { fromLonLat } from 'ol/proj';
import Button from '../../ui/button';

const GridToolControl = function gridToolControl(options = {}) {
  let {
    map,
    viewer,
    checked,
    bbox = {
      north: 10962904,
      west: 1208393,
      south: 7386874,
      east: 2672916
    },
    cellside = 100,
    strokeColor = '#9B78BE',
    fillColor = 'rgba(270, 35, 61, 0.1)',
    units = 'kilometers'
  } = options;

  let gridLayer;

  const style = new Style({
    stroke: new Stroke({
      color: strokeColor,
      width: 3
    }),
    fill: new Fill({
      color: fillColor
    })
  });

  const geojsonObject = {
    type: 'FeatureCollection',
    name: 'gridlayer-3857',
    crs: { type: 'name',
      properties:
            { name: 'urn:ogc:def:crs:EPSG::3857' } }
    /* features: [{
      type: 'Feature',
      geometry: {
        type: 'Polygon',

        // N:10962904 W: 1208393 S: 7386874 E:2672916
        coordinates: [[[bbox.west, bbox.north], [bbox.west, bbox.south], [bbox.east, bbox.south],
          [bbox.east, bbox.north], [bbox.west, bbox.north]]]
      }
    }] */
  };

  const checkIcon = '#ic_check_circle_24px';
  const uncheckIcon = '#ic_radio_button_unchecked_24px';
  const grids = [];

  const getCheckIcon = (visible) => {
    const isVisible = visible ? checkIcon : uncheckIcon;
    return isVisible;
  };

  const createGridLayer = () => {
    const gridLayer = squaregrid([10.03, 54.96, 24.17, 69.07], cellside, { units });
    return gridLayer;
  };

  const createGrids = () => {
    // Get the bounds of the map.
  //  const width = Math.ceil((bbox.east - bbox.west) / cellside);
  //  const height = Math.ceil((bbox.north - bbox.south) / cellside);
    const width = 5;
    const height = 5;
    // Creates grids to cover the map.
    for (let i = 0; i < height; i++) {
      const north = bbox.north - (height * i);
      const south = north - height;
      for (let j = 0; j < width; j++) {
        const west = bbox.west + (width * j);
        const east = bbox.east + (width * j);
        const grid = {
          type: 'Feature',
          geometry: {
            type: 'MultiPolygon',
            coordinates: [
              [[[west, north], [west, south], [east, south],
                [east, north], [west, north]]]
            ]
          }
        };
        grids.push(grid);
      }
    }
    geojsonObject.features = grids;
  };


  const toggleGridLayer = () => {
    if (checked) {
      // createGrids();
      const format = new GeoJSON();
      const test = createGridLayer();
      test.getGeometry().transform('EPSG:4326', 'EPSG:3857');
      debugger;
      // const features = format.readFeature(test);
      const source = new VectorSource({
        test
      });
      debugger;
      gridLayer = new VectorLayer({
        test,
        style,
        removable: true
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
