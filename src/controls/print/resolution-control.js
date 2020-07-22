import { Element as El, Button, Component, Dropdown, dom } from '../../ui';

export default function ResolutionControl(options = {}) {
  const {
    checked,
    resolutions,
    text = 'heureka!'
  } = options;

  let dropdown;

  // dropdown.setButtonText(resolutions[0]);
  // dropdown.setItems(resolutions);

  const onResolutionChanged = () => {

  };


  return Component({
    name: 'resolution-control',
    onAdd(evt) {
      dropdown = Dropdown({
        text,
        cls: 'o-printmap-resolution-dropdown flex border',
        contentCls: 'bg-white',
        buttonCls: 'padding-small rounded',
        buttonIconCls: ''
      });
      this.addComponent(dropdown);
      // this.render();
    // dropdown.setButtonText(resolutions[0]);
    // dropdown.setItems(resolutions);
    },
    onInit() {

    },
    render() {
      this.dispatch('render');
    /*  document.getElementById(dropdown.getId()).addEventListener('dropdown:select', (evt) => {
        onResolutionChanged(evt.target.textContent);
      }); */
    }
  });
}
