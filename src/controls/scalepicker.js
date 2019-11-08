import { Component, Button, Element as El, Collapse, dom, Dropdown } from '../ui';
import mapUtils from '../maputils';

const Scalepicker = function Scalepicker(options = {}) {
  let map;
  let viewer;
  let target;
  let projection;
  let items;
  let resolutions;
  let scalepicker;
  const {
    scales = [1000, 10000, 100000, 1000000]
  } = options;

  const initItemFromScales = () => {
    items = scales.map(scale => {
      return {
        onClick() {
          map.getView().setResolution(mapUtils.scaleToResolution(scale, projection));
        },
        label: `1:${scale}`
      };
    });
  }

  const initItemsFromResolutions = () => {
    items = resolutions.map(resolution => {
      return {
        onClick() {
          const scaleValue = mapUtils.resolutionToScale(resolution, projection);
          map.getView().setResolution(mapUtils.scaleToResolution(scaleValue, projection));
        },
        label: `1:${mapUtils.resolutionToScale(resolution, projection)}`
      };
    });
  }

  scalepicker = Dropdown({
    text: 'Scale Picker',
    style: {
      position: 'absolute',
      top: '1em',
      left: '1em'
    }
  });

  return Component({
    name: 'scalepicker',
    onInit() {
    },
    onAdd(evt) {
      viewer = evt.target;
      map = viewer.getMap();
      resolutions = [...viewer.getResolutions()].reverse();
      projection = map.getView().getProjection();
      target = `${viewer.getMain().getId()}`;
      // target = `${viewer.getMain().getNavigation().getId()}`;
      // initItemFromScales();
      initItemsFromResolutions();
      this.addComponents([scalepicker]);
      this.render();
      scalepicker.setItems(items);
    },
    render() {
      const htmlString = scalepicker.render();
      const el = dom.html(htmlString);
      document.getElementById(target).appendChild(el);
      this.dispatch('render');
    }
  });
};

export default Scalepicker;
