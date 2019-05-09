import { getArea, getLength } from 'ol/sphere';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import DrawInteraction from 'ol/interaction/Draw';
import Overlay from 'ol/Overlay';
import Point from 'ol/geom/Point';
import Polygon from 'ol/geom/Polygon';
import LineString from 'ol/geom/LineString';
import { transform } from 'ol/proj'
import { Component, Element as El, Button, dom } from '../ui';
import Style from '../style';
import StyleTypes from '../style/styletypes';

const Measure = function Measure({
  default: defaultMeasureTool = 'length',
  measureTools = ['length', 'area'],
  displayLengthOnAllSegments = false,
  url: heightToolUrl
} = {}) {
  const style = Style;
  const styleTypes = StyleTypes();

  let map;
  let activeButton;
  let defaultButton;
  let measure;
  let type;
  let sketch;
  let measureTooltip;
  let measureTooltipElement;
  let measureStyleOptions;
  let helpTooltip;
  let helpTooltipElement;
  let vector;
  let source;
  let label;
  let lengthTool;
  let areaTool;
  let heightTool;
  let defaultTool;
  let isActive = false;
  const overlayArray = [];

  let viewer;
  let measureElement;
  let measureButton;
  let lengthToolButton;
  let areaToolButton;
  let heightToolButton;
  const buttons = [];
  let target;

  let segmentOverlays = [];
  let lastSketchSegmentOverlays = [];
  let lastSegment = undefined;
  let lastSegmentLength = undefined;
  let lastSegmentOverlay = undefined;
  let lastSegmentCoordinates = undefined;
  let midPointCoords = undefined;

  function createStyle(feature) {
    const featureType = feature.getGeometry().getType();
    let measureStyle;

    switch (featureType) {
      case 'LineString':
        measureStyle = style.createStyleRule(measureStyleOptions.linestring);
        break;

      case 'Polygon':
        measureStyle = style.createStyleRule(measureStyleOptions.polygon);
        break;

      case 'Point':
        measureStyle = style.createStyleRule(measureStyleOptions.point);
        break;

      default:
        break;
    }

    return measureStyle;
  }

  function setActive(state) {
    isActive = state;
  }

  function createHelpTooltip() {
    if (helpTooltipElement) {
      helpTooltipElement.parentNode.removeChild(helpTooltipElement);
    }

    helpTooltipElement = document.createElement('div');
    helpTooltipElement.className = 'o-tooltip o-tooltip-measure';

    helpTooltip = new Overlay({
      element: helpTooltipElement,
      offset: [15, 0],
      positioning: 'center-left'
    });

    overlayArray.push(helpTooltip);
    map.addOverlay(helpTooltip);
  }

  function createMeasureTooltip() {
    if (measureTooltipElement) {
      measureTooltipElement.parentNode.removeChild(measureTooltipElement);
    }

    measureTooltipElement = document.createElement('div');
    measureTooltipElement.className = 'o-tooltip o-tooltip-measure';

    measureTooltip = new Overlay({
      element: measureTooltipElement,
      offset: [0, -15],
      positioning: 'bottom-center',
      stopEvent: false
    });

    overlayArray.push(measureTooltip);
    map.addOverlay(measureTooltip);
  }

  function formatLength(line) {
    const projection = map.getView().getProjection();
    const length = getLength(line, {
      projection
    });
    let output;

    if (length > 1000) {
      output = `${Math.round((length / 1000) * 100) / 100} km`;
    } else {
      output = `${Math.round(length * 100) / 100} m`;
    }

    return output;
  }

  function formatArea(polygon) {
    const projection = map.getView().getProjection();
    const area = getArea(polygon, {
      projection
    });
    let output;

    if (area > 10000000) {
      output = `${Math.round((area / 1000000) * 100) / 100} km<sup>2</sup>`;
    } else if (area > 10000) {
      output = `${Math.round((area / 10000) * 100) / 100} ha`;
    } else {
      output = `${Math.round(area * 100) / 100} m<sup>2</sup>`;
    }

    const htmlElem = document.createElement('span');
    htmlElem.innerHTML = output;

    [].forEach.call(htmlElem.children, (element) => {
      const el = element;
      if (el.tagName === 'SUP') {
        el.textContent = String.fromCharCode(el.textContent.charCodeAt(0) + 128);
      }
    });

    return htmlElem.textContent;
  }

  // Display and move tooltips with pointer. This handler function handles measureTooltip and helpTooltip
  function pointerMoveHandler(evt) {
    if (evt.dragging) {
      return;
    }

    const helpMsg = 'Klicka för att börja mäta';
    let tooltipCoord = evt.coordinate;

    if (sketch) {
      const geom = (sketch.getGeometry());
      let output;

      if (geom instanceof Polygon) {
        output = formatArea((geom));
        tooltipCoord = geom.getInteriorPoint().getCoordinates();
      } else if (geom instanceof LineString) {
        output = formatLength((geom));
        tooltipCoord = geom.getLastCoordinate();
      }

      measureTooltipElement.innerHTML = output;
      label = output;
      measureTooltip.setPosition(tooltipCoord);
    }

    if (evt.type === 'pointermove') {
      helpTooltipElement.innerHTML = helpMsg;
      helpTooltip.setPosition(evt.coordinate);
    }
  }

  // This handler function handles length tooltips for each segment
  function pointerMoveHandler2(evt) {
    if (evt.dragging) {
      return;
    }

    if (!sketch || !displayLengthOnAllSegments) {
      return;
    }

    const geom = sketch.getGeometry();
    const coords = geom.getCoordinates();

    if (geom instanceof Polygon) {
      lastSegmentCoordinates = [coords[0][coords[0].length - 2], coords[0][coords[0].length - 3]];
    } else if (geom instanceof LineString) {
      lastSegmentCoordinates = [coords[coords.length - 1], coords[coords.length - 2]];
    }
    // This is needed to handle a very special case there polygon has only 1 point with first click.
    if (!lastSegmentCoordinates[1]) {
      return;
    }

    lastSegment = new LineString(lastSegmentCoordinates);
    lastSegmentLength = formatLength(lastSegment);
    midPointCoords = lastSegment.getCoordinateAt(0.5);
    lastSegmentOverlay.getElement().innerHTML = lastSegmentLength;
    lastSegmentOverlay.setPosition(midPointCoords);
  }

  function pointerClickHandler(evt) {
    if (!sketch || !displayLengthOnAllSegments) {
      return;
    }

    const segmentTooltipElement = document.createElement('div');
    segmentTooltipElement.className = 'o-tooltip o-tooltip-measure';

    const segmentTooltip = new Overlay({
      element: segmentTooltipElement,
      offset: [0, 0],
      positioning: 'center-center',
      stopEvent: false
    });
    lastSketchSegmentOverlays.push(segmentTooltip);
    map.addOverlay(segmentTooltip);
    lastSegmentOverlay = lastSketchSegmentOverlays[lastSketchSegmentOverlays.length - 1];
  }

  function createLastSegmentOverlay() {
    const coords = sketch.getGeometry().getCoordinates();
    lastSegmentCoordinates = [coords[0][coords[0].length - 1], coords[0][coords[0].length - 2]];

    // This is needed to handle a very special case there polygon has only 1 point with first click.
    if (!lastSegmentCoordinates[1]) {
      return;
    }

    lastSegment = new LineString(lastSegmentCoordinates);
    lastSegmentLength = formatLength(lastSegment);
    midPointCoords = lastSegment.getCoordinateAt(0.5);
    // There is no need to create a new Overlay here beacuse the dbclick that ends drawing fires a click event first 
    // and therefore clickEventHandler has already created a new Overlay and changed the reference of the lastSegmentOverlay to it.
    lastSegmentOverlay.getElement().innerHTML = lastSegmentLength;
    lastSegmentOverlay.setPosition(midPointCoords);
  }

  function disableInteraction() {
    if (activeButton) {
      document.getElementById(activeButton.getId()).classList.remove('active');
    }
    document.getElementById(measureButton.getId()).classList.remove('active');
    if (lengthTool) {
      document.getElementById(lengthToolButton.getId()).classList.add('hidden');
    }
    if (areaTool) {
      document.getElementById(areaToolButton.getId()).classList.add('hidden');
    }
    if (heightTool) {
      document.getElementById(heightToolButton.getId()).classList.add('hidden');
    }
    document.getElementById(measureButton.getId()).classList.add('tooltip');
    setActive(false);

    map.un('pointermove', pointerMoveHandler);
    map.un('pointermove', pointerMoveHandler2);
    map.un('click', pointerClickHandler);
    map.removeInteraction(measure);
    vector.setVisible(false);
    viewer.removeOverlays(overlayArray);
    viewer.removeOverlays(segmentOverlays);
    viewer.removeOverlays(lastSketchSegmentOverlays);
    lastSketchSegmentOverlays = [];
    sketch = null;
    vector.getSource().clear();
    setActive(false);
  }

  function enableInteraction() {
    document.getElementById(measureButton.getId()).classList.add('active');
    if (lengthTool) {
      document.getElementById(lengthToolButton.getId()).classList.remove('hidden');
    }
    if (areaTool) {
      document.getElementById(areaToolButton.getId()).classList.remove('hidden');
    }
    if (heightTool) {
      document.getElementById(heightToolButton.getId()).classList.remove('hidden');
    }
    document.getElementById(measureButton.getId()).classList.remove('tooltip');
    setActive(true);
    document.getElementById(defaultButton.getId()).click();
  }

  function addInteraction() {
    vector.setVisible(true);

    measure = new DrawInteraction({
      source,
      type,
      style: style.createStyleRule(measureStyleOptions.interaction)
    });

    map.addInteraction(measure);
    createMeasureTooltip();
    createHelpTooltip();
    map.on('pointermove', pointerMoveHandler);

    measure.on('drawstart', (evt) => {
      // set sketch
      sketch = evt.feature;
      helpTooltip.getElement().classList.add('hidden');
      measureTooltip.getElement().classList.remove('hidden');
      measureTooltip.getElement().innerHTML = sketch.getGeometry() instanceof Polygon ? `0 m<sup>2</sup>` : `0 m`;
      measureTooltip.setPosition(evt.feature.getGeometry().getLastCoordinate());
      map.on('pointermove', pointerMoveHandler2);
      map.on('click', pointerClickHandler);
    }, this);

    measure.on('drawend', (evt) => {
      // unregistering listeners first, otherwise in some rare cases one pointermove event fires before setting null on sketch
      map.un('pointermove', pointerMoveHandler2);
      map.un('click', pointerClickHandler);
      const feature = evt.feature;
      feature.setStyle(createStyle(feature));
      feature.getStyle()[0].getText().setText(label);
      helpTooltip.getElement().classList.remove('hidden');
      measureTooltip.getElement().classList.add('hidden');
      segmentOverlays = segmentOverlays.concat(lastSketchSegmentOverlays);
      lastSketchSegmentOverlays = [];
      // When drawing a polygon is done one last segment from last point to the first point is drawn. So we need one more Overlay.
      if (sketch.getGeometry() instanceof Polygon && displayLengthOnAllSegments) {
        createLastSegmentOverlay();
      }
      if (sketch.getGeometry() instanceof Point) {
        handleHeight(evt);
      }
      // unset sketch
      sketch = null;
    }, this);
  }


  function handleHeight(evt) {
    const feature = evt.feature;
    const coordinates = evt.feature.getGeometry().getCoordinates();
    feature.setStyle(createStyle(feature));
    feature.getStyle()[0].getText().setText('Hämtar höjd...');
    fetchHeight(coordinates)
      .then((response) => {
        return response.json();
      })
      .then((response) => {
        const heightValue = response.geometry.coordinates[2];
        const heightValueShortened = heightValue.toFixed(1);
        feature.getStyle()[0].getText().setText(heightValueShortened + ' m');
        source.changed();
      }).catch(err => {
        console.log(err);
        feature.getStyle()[0].getText().setText(null);
        source.changed();
      });
  }

  function fetchHeight(coordinates) {
    const projectionCode = viewer.getProjectionCode();
    const transformedCoordinates = transform(coordinates, projectionCode, 'EPSG:3006');
    if (!heightToolUrl) {
      return Promise.reject("No url found in order to fetch the height");
    }
    const url = heightToolUrl.replace('easting', transformedCoordinates[0]).replace('northing', transformedCoordinates[1]);
    return fetch(url, {
      mode: "cors"
    });
  }

  function toggleMeasure() {
    if (isActive) {
      document.dispatchEvent(new CustomEvent('toggleInteraction', {
        bubbles: true,
        detail: 'featureInfo'
      }));
      disableInteraction();
    } else {
      document.dispatchEvent(new CustomEvent('toggleInteraction', {
        bubbles: true,
        detail: 'measure'
      }));
      enableInteraction();
    }
  }

  function toggleType(button) {
    if (activeButton) {
      document.getElementById(activeButton.getId()).classList.remove('active');
    }
    document.getElementById(button.getId()).classList.add('active');
    activeButton = button;
    map.removeInteraction(measure);
    addInteraction();
    viewer.removeOverlays(lastSketchSegmentOverlays);
    lastSketchSegmentOverlays = [];
    sketch = null;
  }

  return Component({
    name: 'measure',
    onAdd(evt) {
      viewer = evt.target;
      target = `${viewer.getMain().getMapTools().getId()}`;

      map = viewer.getMap();
      source = new VectorSource();
      measureStyleOptions = styleTypes.getStyle('measure');

      // Drawn features
      vector = new VectorLayer({
        group: 'none',
        source,
        name: 'measure',
        visible: false,
        zIndex: 6
      });

      map.addLayer(vector);
      this.addComponents(buttons);
      this.render();
    },
    onInit() {
      lengthTool = measureTools.indexOf('length') >= 0;
      areaTool = measureTools.indexOf('area') >= 0;
      heightTool = measureTools.indexOf('height') >= 0;
      defaultTool = measureTools.indexOf(defaultMeasureTool) >= 0 ? defaultMeasureTool : measureTools[0];

      if (lengthTool || areaTool || heightTool) {
        measureElement = El({
          tagName: 'div',
          cls: 'flex column'
        });

        measureButton = Button({
          cls: 'o-measure padding-small margin-bottom-smaller icon-smaller rounded light box-shadow',
          click() {
            toggleMeasure();
          },
          icon: '#ic_straighten_24px'
        });
        buttons.push(measureButton);

        if (lengthTool) {
          lengthToolButton = Button({
            cls: 'o-measure-length padding-small margin-bottom-smaller icon-smaller rounded light box-shadow hidden',
            click() {
              type = 'LineString';
              toggleType(this);
            },
            icon: '#minicons-line-vector',
            tooltipText: 'Linje',
            tooltipPlacement: 'north'
          });
          buttons.push(lengthToolButton);
          if (defaultTool === 'length') {
            defaultButton = lengthToolButton;
          }
        }

        if (areaTool) {
          areaToolButton = Button({
            cls: 'o-measure-area padding-small margin-bottom-smaller icon-smaller rounded light box-shadow hidden',
            click() {
              type = 'Polygon';
              toggleType(this);
            },
            icon: '#minicons-square-vector',
            tooltipText: 'Yta',
            tooltipPlacement: 'north'
          });
          buttons.push(areaToolButton);
          if (defaultTool === 'area') {
            defaultButton = areaToolButton;
          }
        }

        if (heightTool) {
          heightToolButton = Button({
            cls: 'o-measure-height padding-small icon-smaller rounded light box-shadow hidden',
            click() {
              type = 'Point';
              toggleType(this);
            },
            icon: '#fa-arrows-v',
            tooltipText: 'Höjd',
            tooltipPlacement: 'north'
          });
          buttons.push(heightToolButton);
          if (defaultTool === 'height') {
            defaultButton = heightToolButton;
          }
        }
      }
    },
    render() {
      let htmlString = `${measureElement.render()}`;
      let el = dom.html(htmlString);
      document.getElementById(target).appendChild(el);
      htmlString = measureButton.render();
      el = dom.html(htmlString);
      document.getElementById(measureElement.getId()).appendChild(el);
      if (lengthTool) {
        htmlString = lengthToolButton.render();
        el = dom.html(htmlString);
        document.getElementById(measureElement.getId()).appendChild(el);
      }
      if (areaTool) {
        htmlString = areaToolButton.render();
        el = dom.html(htmlString);
        document.getElementById(measureElement.getId()).appendChild(el);
      }
      if (heightTool) {
        htmlString = heightToolButton.render();
        el = dom.html(htmlString);
        document.getElementById(measureElement.getId()).appendChild(el);
      }
      this.dispatch('render');
    }
  });
};

export default Measure;
