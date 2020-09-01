import GeoJSON from 'ol/format/GeoJSON';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Point from 'ol/geom/Point';
import Feature from 'ol/Feature';
import * as ol from 'ol/style';
import * as projection from '@turf/projection';
import squaregrid from '@turf/square-grid';

class GridToolControl {
  constructor(options, map) {
    this.options = options;
    this.map = map;
    this.viewer = this.map.getView();
    this.gridLayer = undefined;
    this.gridLabels = undefined;
    this.style = undefined;
    this.axisCoordinates = undefined;

    this.addEvents();
    this.setStyle();
  }

  addEvents() {
    this.map.getView().on('change:rotation', () => {
      if (this.gridLayer !== undefined) {
        this.viewer.setRotation(0);
        // eslint-disable-next-line no-underscore-dangle
        this.viewer.options_.enableRotation = false;
      }
    });
  }

  setStyle() {
    this.style = new ol.Style({
      stroke: new ol.Stroke({
        color: this.options.strokeColor,
        width: 2
      }),
      fill: new ol.Fill({
        color: this.options.fillColor
      }),
      text: new ol.Text({
        font: '10px Calibri,sans-serif',
        fill: new ol.Fill({
          color: '#000'
        })
      })
    });
    return this.style;
  }

  // Gets the number of grids in height and width.
  getAxisCoordinates(layer) {
    const horizontal = [];
    const vertical = [];
    let checkNorth;
    let north;
    let west;
    let east;
    let south;
    debugger;
    // extent in minX, minY, maxX, maxY order
    for (let i = 0; i < layer.features.length; i += 1) {
      north = layer.features[i].geometry.coordinates[0][0][1];
      south = layer.features[i].geometry.coordinates[0][2][1];
      west = layer.features[i].geometry.coordinates[0][0][0];
      east = layer.features[i].geometry.coordinates[0][1][0];
      /*
      west = layer.features[i].geometry.coordinates[0][1][0];
      north = layer.features[i].geometry.coordinates[0][1][1];
      south = layer.features[i].geometry.coordinates[0][2][1];
      */
      if (checkNorth === undefined) {
        checkNorth = north;
      } else if (checkNorth > north) {
        break;
      } else {
        horizontal.push([east, north]);
      }
    }
    for (let j = 0; j < layer.features.length; j += horizontal.length) {
      north = layer.features[j].geometry.coordinates[0][0][0];
      west = layer.features[j].geometry.coordinates[0][0][1];
      south = layer.features[j].geometry.coordinates[0][2][0];
      vertical.push([(north - ((north - south) / 2)), (west - 10)]);
    }
    debugger;
    this.axisCoordinates = { horizontal, vertical };
    return this.axisCoordinates;
  }

  // Adds horizontal and vertical labels on x- and y-axis.
  createGridLabels(grid) {
    const bounds = this.getAxisCoordinates(grid);
    const features = [];
    let horizontalIndex = 64;
    for (let i = 0; i < bounds.horizontal.length; i += 1) {
      const horizontalLabel = String.fromCharCode(horizontalIndex += 1);
      features.push(
        new Feature({
          geometry: new Point(bounds.horizontal[i]),
          i: horizontalLabel,
          size: 10
        })
      );
    }
    for (let j = 0; j < bounds.vertical.length; j += 1) {
      const verticalLabel = j.toString();
      features.push(
        new Feature({
          geometry: new Point(bounds.vertical[j]),
          i: verticalLabel,
          size: 1000
        })
      );
    }
    debugger;

    const emystyle = new ol.Style({
      image: new ol.Circle({
        radius: 7,
        fill: new ol.Fill({ color: 'black' }),
        stroke: new ol.Stroke({
          color: [255, 0, 0], width: 2
        })
      })
    });


    const source = new VectorSource({
      features
    });
    const vectorLayer = new VectorLayer({
      source,
      style(feature) {
        debugger;
        //  const zoom = this.map.getView().getZoom();
        //  const fontSize = zoom * 10; // arbitrary value
        return [
          new ol.Style({
            text: new ol.Text({
              font: '12px Calibri,sans-serif',
              fill: new ol.Fill({ color: '#000' }),
              stroke: new ol.Stroke({
                color: '#fff', width: 2
              }),
              text: feature.get('i')
            })
          })
        ];
      },
      removable: true,
      declutter: true,
      className: 'printmap-squaregrid-labels',
      name: 'printmap-squaregrid-labels'
    });
    return vectorLayer;
  }

  // Creates and return SquareGrids as vectordata.
  createGridLayer() {
    const u = this.options.units;
    const squareGrids = squaregrid(this.options.bbox, this.options.cellside, { u });
    const projected = projection.toMercator(squareGrids);
    const source = new VectorSource({
      features: new GeoJSON().readFeatures(projected)
    });
    this.gridLabels = this.createGridLabels(projected);

    const vectorLayer = new VectorLayer({
      source,
      style: this.style,
      removable: true,
      declutter: true,
      className: 'printmap-squaregrid-layer',
      name: 'printmap-squaregrid-layer'
    });
    return vectorLayer;
  }

  add() {
    if (this.gridLayer === undefined) {
      this.gridLayer = this.createGridLayer();
      this.map.addLayer(this.gridLayer);
      this.map.addLayer(this.gridLabels);
      this.viewer.setRotation(0);
      // eslint-disable-next-line no-underscore-dangle
      this.viewer.options_.enableRotation = false;
    }
    return this.gridLayer;
  }

  remove() {
    if (this.gridLayer !== undefined) {
      this.map.removeLayer(this.gridLayer);
      this.map.removeLayer(this.gridLabels);
      // eslint-disable-next-line no-underscore-dangle
      this.viewer.options_.enableRotation = true;
      this.gridLayer = undefined;
    }
    return this.gridLayer;
  }
}

export default GridToolControl;
