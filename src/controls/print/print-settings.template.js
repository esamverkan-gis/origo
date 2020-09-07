export default function printTemplate({
  id,
  customSizeControl,
  descriptionControl,
  marginControl,
  scaleControl,
  orientationControl,
  sizeControl,
  titleControl,
  createdControl,
  gridToolControl,
  resolutionDropdown
}) {
  return `
  <div id="${id}" class="flex column no-print padding-large width-16">
    <h6>Rubrik</h6>
    ${titleControl.render()}
    <div class="padding-top"></div>
    <h6>Beskrivning</h6>
    ${descriptionControl.render()}
    <div class="padding-top"></div>
    <h6>Storlek</h6>
    ${sizeControl.render()}
    <div class="padding-top"></div>
    ${customSizeControl.render()}
    <div class="padding-top"></div>
    <h6>Orientering</h6>
    ${orientationControl.render()}
    <div class="padding-top-large"></div>
    <div class="flex padding-right-small">
      <div class="grow text-normal">Använd marginaler</div>
      ${marginControl.render()}
    </div>
    <div class="padding-top-large"></div>
    <div class="flex padding-right-small">
      <div class="grow text-normal">Visa Skala</div>
      ${scaleControl.render()}
    </div>
    <div class="padding-top-large"></div>
    <div class="flex padding-right-small">
      <div class="grow text-normal">Visa skapad tid</div>
      ${createdControl.render()}
    </div>
    <div class="padding-top-large"></div>
    <div class="flex padding-right-small">
      <div class="grow text-normal">Lägg till rutnät</div>
      ${gridToolControl.render()}
    </div>
    <div class="padding-top-large"></div>
    <h6>Upplösning (dpi)</h6>
    <div class="flex padding-right-small o-print-resolution-dropdown">
      ${resolutionDropdown.render()}
    <div class="flex padding-right-small" id="printmap-gridtool-menu-container">
    <label for="colorpicker">Färg</label>
    <input type="color" id="printmap-gridtool-colorpicker" name="colorpicker">
    <br/>
    <label for="gridsize">Rutstorlek</label>
    <input type="number" id="printmap-gridtool-gridsize-input" name="gridsize" min="1" value=10>
    <select name="unitOptions" id="printmap-gridtool-unit-options">
      <option value="kilometers">Km</option>
      <option value="meters">m</option>
    </select>
    <br/>
    <button class="grow light text-smaller padding-left-large o-tooltip active" id="printmap-gridtool-draw-button">Rita rutnät</button>
    </div>
    <div class="padding-top"></div>
  </div>`;
}
