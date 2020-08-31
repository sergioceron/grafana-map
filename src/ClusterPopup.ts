const types = ['Bootnode', 'Validator', 'Writer', 'Observer'];
export default class ClusterPopup {
  render(feature: any) {
    const wrapper = document.createElement('div');
    const summaryDiv = document.createElement('div');
    summaryDiv.innerHTML = `Type: ${types[feature.graphic.attributes.nodeType]}<br />
                            Organization: ${feature.graphic.attributes.organization}<br />
                            IP Address: ${feature.graphic.attributes.ip}<br />`;
    wrapper.appendChild(summaryDiv);
    return wrapper;
  }
}
