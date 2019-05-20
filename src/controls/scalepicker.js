import { Component, Button, Element as El, Collapse, dom } from '../ui';

const Scalepicker = function Scalepicker({
  closeIcon = '#ic_close_24px',
  menuIcon = '#ic_menu_24px'
} = {}) {
  let headerComponent;
  let contentComponent;
  let viewer;
  let target;

  const testComponent = El({
    tagName: 'div',
    cls: 'flex column',
    innerHTML: '<div>Hej</div>'
  });

  return Component({
    name: 'scalepicker',
    onAdd(evt) {
      viewer = evt.target;
      target = `${viewer.getMain().getId()}`;
      this.addComponents([testComponent]);
      this.render();
    },
    onInit() {
      console.log('inting Scale Picker');
    },
    render() {
      console.log('rendering scalepicker');
      const elStr = testComponent.render();
      const menuEl = dom.html(elStr);
      // const menuEl = dom.html(`<div class="relative width-12"><ul class="padding-y-small" id="${this.getId()}"">Scale picker</ul></div>`);
      document.getElementById(target).appendChild(menuEl);
      this.dispatch('render');
    }
  });
};

export default Scalepicker;
