export default class ClusterPopup {
  render(feature: any) {
    const wrapper = document.createElement('div');
    const summaryDiv = document.createElement('div');
    summaryDiv.innerHTML = `IP: ${feature.graphic.attributes.ip}`;
    wrapper.appendChild(summaryDiv);
    return wrapper;
  }
}
