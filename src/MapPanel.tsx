import React, { PureComponent } from 'react';
import { PanelProps } from '@grafana/data';
import { MapOptions, MapStyle } from './types';
import { css } from 'emotion';
// @ts-ignore
import ethers from 'ethers';
// @ts-ignore
import request from 'request';

// @ts-ignore
import ngeohash from 'ngeohash';

// @ts-ignore
import nodeIngressABI from './contracts/NodeIngress.json';
// @ts-ignore
import nodeListABI from './contracts/NodeList.json';
import { loadCss, loadModules } from 'esri-loader';
import MapLayer from './MapLayer';

interface Props extends PanelProps<MapOptions> {}
interface State {
  // eslint-disable-next-line
}

const ipv4Prefix = '00000000000000000000ffff';

const splitAddress = (address: string, digits: number) => {
  const bits: string[] = [];

  while (address.length >= digits) {
    bits.push(address.slice(0, digits));
    address = address.slice(digits);
  }
  return bits;
};

const hexToAscii = (str: string): string => {
  const hex = str.substr(2);
  let result = '';
  for (let n = 0; n < hex.length; n += 2) {
    result += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
  }
  return result;
};

const getIpv4 = (address: string) => {
  return splitAddress(address.split(ipv4Prefix)[1], 2)
    .map(hex => {
      return parseInt(hex, 16);
    })
    .join('.');
};

export class MapPanel extends PureComponent<Props, State> {
  mapRef = React.createRef<HTMLDivElement>();

  componentDidMount() {
    const { options } = this.props;
    const {
      style,
      besuSettings: { ingressContractAddress, rpcUrl },
      mapSettings: { nodeMarkerColor },
    } = options;
    const nodeIngress = new ethers.Contract(
      ingressContractAddress,
      nodeIngressABI,
      new ethers.providers.JsonRpcProvider(rpcUrl)
    );

    loadCss(`https://js.arcgis.com/4.16/esri/themes/${style}/main.css`, 'style');
    loadModules(['esri/Map', 'esri/views/MapView', 'esri/layers/FeatureLayer', 'esri/geometry/Point'], {
      css: false,
    }).then(([ArcGISMap, MapView, FeatureLayer, Point]) => {
      const map = new ArcGISMap({
        basemap: style === MapStyle.dark ? 'dark-gray' : 'gray',
      });

      const view = new MapView({
        container: this.mapRef.current,
        map: map,
        center: [0, 34],
        zoom: 2,
      });
      const mapLayer = new MapLayer(nodeMarkerColor);
      const layer = new FeatureLayer(mapLayer.getLayer());
      map.add(layer);

      nodeIngress
        .getContractAddress('0x72756c6573000000000000000000000000000000000000000000000000000000')
        .then(async (address: string) => {
          const nodeList = new ethers.Contract(address, nodeListABI, new ethers.providers.JsonRpcProvider(rpcUrl));
          const size = parseInt(await nodeList.getSize(), 10);
          for (let i = 1; i < size; i++) {
            nodeList.getByIndex(i).then(async (allowlist: any) => {
              const geoHash: string = hexToAscii(allowlist[5] + '');
              const ipHex = allowlist[2];
              const ip = getIpv4(ipHex.split('x')[1]);
              // @ts-ignore
              const { longitude, latitude } = ngeohash.decode(geoHash);
              await layer.applyEdits({
                addFeatures: [
                  {
                    geometry: new Point({ y: latitude, x: longitude }),
                    attributes: {
                      ObjectID: i,
                      ip,
                      lon: longitude,
                      lat: latitude,
                      nodeType: allowlist[4],
                      name: allowlist[6],
                      organization: allowlist[7],
                    },
                  },
                ],
              });
            });
          }
          // @ts-ignore
        });

      return () => {
        if (view) {
          // destroy the map view
          view.container = null;
        }
      };
    });
  }

  render() {
    const { width, height } = this.props;

    const clazz = css`
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      font-size: 40px;
      text-align: center;
    `;
    return (
      <div
        className={clazz}
        style={{
          width,
          height,
        }}
      >
        <div className="webmap" style={{ width: '100%', height: '300px', backgroundColor: '#FFF' }} ref={this.mapRef} />
      </div>
    );
  }
}
