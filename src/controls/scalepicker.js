import { Component, Button, Element as El, Collapse, dom } from '../ui';
import mapUtils from '../maputils';

const Scalepicker = function Scalepicker({
  closeIcon = '#ic_close_24px',
  menuIcon = '#ic_menu_24px'
} = {}) {
  let headerComponent;
  let contentComponent;
  let headerButton;
  let map;
  let viewer;
  let target;
  let projection;
  let buttons;
  let resolutions;
  let scalepicker;

  const initButtons = () => {
    buttons = resolutions.map(resolution => {
      return Button({
        cls: 'padding-small icon-smaller rounded light flex column spacing-vertical-small',
        click() {
          const scaleValue = mapUtils.resolutionToScale(resolution, projection);
          map.getView().setResolution(mapUtils.scaleToResolution(scaleValue, projection));
        },
        text: `1:${roundScale(mapUtils.resolutionToScale(resolution, projection))}`
      });
    });
  }

  const toggle = function toggle() {
    if (headerButton.getState() === 'hidden') {
      headerButton.setState('initial');
      // closeButton.setState('hidden');
    } else {
      headerButton.setState('hidden');
      // closeButton.setState('initial');
    }
    const customEvt = new CustomEvent('collapse:toggle', {
      bubbles: true
    });
    document.getElementById(headerButton.getId()).dispatchEvent(customEvt);
  };

  const roundScale = (scale) => {
    const differens = scale % 10; //is the number not even? 
    if (differens != 0) {
      scale = scale + (10 - differens);
    }
    return scale;
  }

  headerButton = Button({
    cls: 'padding-small icon-smaller light text-normal',
    text: 'ScalePicker',
    icon: '#fa-caret-down',
    tooltipText: 'Meny',
    tooltipPlacement: 'west',
    state: 'initial',
    validStates: ['initial', 'hidden'],
    click() {
      toggle();
    }
  });

  headerComponent = El({
    cls: 'flex row justify-center',
    style: { width: '100%' },
    components: [headerButton]
  });

  contentComponent = Component({
    render() {
      return `<div class="relative width-8" id="${this.getId()}">${buttons.map(button => {
        return button.render();
      }).join('')}</div>`;
    }
  });

  scalepicker = Collapse({
    cls: 'absolute flex column top-left rounded box-shadow bg-white overflow-hidden',
    collapseX: false,
    headerComponent,
    contentComponent
  });

  return Component({
    name: 'scalepicker',
    onAdd(evt) {
      viewer = evt.target;
      map = viewer.getMap();
      // resolutions = map.getView().getResolutions();
      resolutions = [...viewer.getResolutions()].reverse();
      projection = map.getView().getProjection();
      target = `${viewer.getMain().getId()}`;
      // target = `${viewer.getMain().getNavigation().getId()}`;
      initButtons();
      this.addComponents([scalepicker]);
      this.render();
    },
    onInit() {
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
