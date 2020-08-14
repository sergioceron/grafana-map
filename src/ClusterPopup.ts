export default class ClusterPopup {
  render(feature: any) {
    const wrapper = document.createElement('div');
    const besuDiv = document.createElement('div');
    besuDiv.innerHTML = `Besu: ${feature.graphic.attributes.besu}`;
    const osDiv = document.createElement('div');
    osDiv.innerHTML = `OS: ${feature.graphic.attributes.os}`;
    const activeDiv = document.createElement('div');
    activeDiv.innerHTML = `Active: ${feature.graphic.attributes.active}`;
    const typeDiv = document.createElement('div');
    typeDiv.innerHTML = `Type: ${feature.graphic.attributes.type}`;
    wrapper.appendChild(besuDiv);
    wrapper.appendChild(osDiv);
    wrapper.appendChild(activeDiv);
    wrapper.appendChild(typeDiv);
    return wrapper;
  }
}
