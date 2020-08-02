import {
  Component, Button, Element as El, Collapse, Dropdown
} from '../../ui';
import printSettingsTemplate from './print-settings.template';
import CustomSizeControl from './custom-size-control';
import DescriptionControl from './description-control';
import MarginControl from './margin-control';
import GridToolControl from './gridtool-control';
import OrientationControl from './orientation-control';
import SizeControl from './size-control';
import TitleControl from './title-control';
import CreatedControl from './created-control';
import ScaleControl from './scale-control';


const PrintSettings = function PrintSettings({
  closeIcon = '#ic_close_24px',
  initialSize,
  openIcon = '#ic_tune_24px',
  orientation = 'portrait',
  customSize,
  sizes,
  showCreated,
  showScaleText,
  map,
  viewer
} = {}) {
  let headerComponent;
  let contentComponent;
  let openButton;
  let closeButton;
  let printSettingsContainer;
  let customSizeControl;
  const resolutions = [150, 300];
  const toggle = function toggle() {
    if (openButton.getState() === 'hidden') {
      openButton.setState('initial');
      closeButton.setState('hidden');
    } else {
      openButton.setState('hidden');
      closeButton.setState('initial');
    }
    const customEvt = new CustomEvent('collapse:toggle', {
      bubbles: true
    });
    document.getElementById(openButton.getId()).dispatchEvent(customEvt);
  };

  const close = function close() {
    openButton.setState('initial');
    closeButton.setState('hidden');
    const customEvt = new CustomEvent('collapse:collapse', {
      bubbles: true
    });
    document.getElementById(openButton.getId()).dispatchEvent(customEvt);
  };

  return Component({
    close,
    onInit() {
      openButton = Button({
        cls: 'padding-small icon-smaller light text-normal',
        icon: openIcon,
        tooltipText: 'Visa inställningar',
        tooltipPlacement: 'east',
        state: 'initial',
        validStates: ['initial', 'hidden'],
        click() {
          toggle();
        }
      });
      closeButton = Button({
        cls: 'small round margin-top-small margin-right small icon-smaller grey-lightest',
        icon: closeIcon,
        state: 'hidden',
        validStates: ['initial', 'hidden'],
        click() {
          toggle();
        }
      });
      headerComponent = El({
        cls: 'flex row justify-end',
        style: { width: '100%' },
        components: [openButton, closeButton]
      });

      const orientationControl = OrientationControl({ orientation });
      const sizeControl = SizeControl({ initialSize, sizes });
      const titleControl = TitleControl({});
      const descriptionControl = DescriptionControl();
      const marginControl = MarginControl({ checked: true });
      const scaleControl = ScaleControl({ checked: showScaleText, map, viewer });
      const gridToolControl = GridToolControl({ checked: false, map, viewer });
      const createdControl = CreatedControl({ checked: showCreated });
      const resolutionDropdown = Dropdown({
        text: 150,
        cls: 'o-printmap-resolution-dropdown flex border',
        contentCls: 'bg-white',
        buttonCls: 'padding-small rounded',
        buttonIconCls: ''
      });
      customSizeControl = CustomSizeControl({
        state: initialSize === 'custom' ? 'active' : 'inital',
        height: customSize[0],
        width: customSize[1]
      });

      contentComponent = Component({
        onRender() { this.dispatch('render'); },
        render() {
          return printSettingsTemplate({
            id: this.getId(),
            customSizeControl,
            descriptionControl,
            marginControl,
            scaleControl,
            orientationControl,
            sizeControl,
            titleControl,
            createdControl,
            resolutionDropdown
            gridToolControl
          });
        }
      });
      contentComponent.addComponents([customSizeControl, marginControl, scaleControl, orientationControl, sizeControl, titleControl, descriptionControl, createdControl, gridToolControl, resolutionDropdown]);
      printSettingsContainer = Collapse({
        cls: 'no-print fixed flex column top-left rounded box-shadow bg-white overflow-hidden z-index-ontop-high',
        collapseX: true,
        collapseY: true,
        headerComponent,
        contentComponent
      });
      this.addComponent(printSettingsContainer);

      descriptionControl.on('change', (evt) => this.dispatch('change:description', evt));
      marginControl.on('change:check', (evt) => this.dispatch('change:margin', evt));
      orientationControl.on('change:orientation', (evt) => this.dispatch('change:orientation', evt));
      sizeControl.on('change:size', (evt) => this.dispatch('change:size', evt));
      sizeControl.on('change:size', this.onChangeSize.bind(this));
      customSizeControl.on('change:size', (evt) => this.dispatch('change:size-custom', evt));
      titleControl.on('change', (evt) => this.dispatch('change:title', evt));
      createdControl.on('change:check', (evt) => this.dispatch('change:created', evt));
      scaleControl.on('change:check', (evt) => this.dispatch('change:scale', evt));

      resolutionDropdown.on('render', () => {
        resolutionDropdown.setButtonText(resolutions[0]);
        resolutionDropdown.setItems(resolutions);
        document.getElementById(resolutionDropdown.getId()).addEventListener('dropdown:select', (evt) => {
          const resolution = evt.target.textContent;
          resolutionDropdown.setButtonText(resolution);
          this.dispatch('dropdown:select', resolution);
        });
      });
    },
    onChangeSize(evt) {
      const visible = evt.size === 'custom';
      customSizeControl.dispatch('change:visible', { visible });
    },
    onRender() {
      this.dispatch('render');
    },
    render() {
      return printSettingsContainer.render();
    }
  });
};

export default PrintSettings;
