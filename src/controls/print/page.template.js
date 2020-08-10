export default function pageTemplate({
  descriptionComponent,
  printMapComponent,
  titleComponent,
  createdComponent,
  scaleComponent
}) {
  return `
  ${titleComponent.render()}
  ${printMapComponent.render()}
  ${descriptionComponent.render()}
  ${scaleComponent.render()}
  ${createdComponent.render()}
`;
}
