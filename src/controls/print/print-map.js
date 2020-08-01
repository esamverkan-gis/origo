import olAttribution from 'ol/control/Attribution';
import olScaleLine from 'ol/control/ScaleLine';
import { dom, Component, Element as El } from '../../ui';
import Logo from './logo';
import NorthArrow from './north-arrow';

export default function PrintMap(options = {}) {
  const {
    baseUrl,
    logo,
    map,
    viewer
  } = options;

  let scaleLine;
  let mapControls;

  const topRightMapControls = El({ cls: 'flex column align-start absolute top-right transparent z-index-ontop-middle' });
  const bottomLeftMapControls = El({ cls: 'flex column align-start absolute bottom-left transparent z-index-ontop-middle' });
  const bottomRightMapControls = El({ cls: 'flex column align-start absolute bottom-right transparent z-index-ontop-middle' });
  const logoComponent = Logo({ baseUrl, logo });
  const northArrowComponent = NorthArrow({ baseUrl, logo, map });

  map.on('rendercomplete', () => {
    const stepMarkers = document.getElementsByClassName('ol-scale-step-marker');
    if (stepMarkers.length !== 0) {
      for (let j = 0; j < stepMarkers.length; j += 1) {
        const stepMarker = stepMarkers[j];
        if (j === 0) {
          stepMarker.style.top = '1px';
        } else {
          stepMarker.style.top = '-9px';
        }
      }
      const singlebar = document.getElementsByClassName('ol-scale-singlebar')[0];
      if (document.getElementsByClassName('ol-scale-sub-step-marker').length === 0) {
        for (let i = 1; i < 10; i += 1) {
          const el = document.createElement('div');
          el.classList.add('ol-scale-sub-step-marker');
          const margin = i * 10;
          el.style.marginLeft = `${margin.toString()}%`;
          singlebar.appendChild(el);
        }
      }
    }
  });
  return Component({
    onInit() {
      this.addComponent(bottomLeftMapControls);
      this.addComponent(bottomRightMapControls);
    },
    onRender() {
      this.dispatch('render');
    },
    addPrintControls() {
      const el = document.getElementById(bottomLeftMapControls.getId());
      el.appendChild(dom.html(logoComponent.render()));
      const el2 = document.getElementById(topRightMapControls.getId());
      el2.appendChild(dom.html(northArrowComponent.render()));

      scaleLine = new olScaleLine({
        className: 'print-scale-line',
        steps: 2,
        bar: true,
        target: bottomRightMapControls.getId()
      });
      const attribution = new olAttribution({
        className: 'print-attribution',
        collapsible: false,
        collapsed: false,
        target: bottomLeftMapControls.getId()
      });
      mapControls = [scaleLine, attribution];
      map.addControl(scaleLine);
      map.addControl(attribution);
    },
    removePrintControls() { mapControls.forEach((mapControl) => map.removeControl(mapControl)); },
    render() {
      return `
      <div class="flex grow relative no-margin width-full height-full">
        ${topRightMapControls.render()}
        ${bottomLeftMapControls.render()}
        ${bottomRightMapControls.render()}
        <div id="${this.getId()}" class="no-margin width-full height-full"></div>
      </div>
      `;
    }
  });
}
