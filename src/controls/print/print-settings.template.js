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
    <h6>Upplösning (dpi)</h6>
    <div class="flex padding-right-small o-print-resolution-dropdown">
      ${resolutionDropdown.render()}
    </div>
    <div class="padding-top"></div>
  </div>`;
}
