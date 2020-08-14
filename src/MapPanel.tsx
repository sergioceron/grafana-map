import React, { PureComponent } from 'react';
import { PanelProps } from '@grafana/data';
import deepstream from 'deepstream.io-client-js';
import { MapOptions, MapStyle } from './types';
import { css } from 'emotion';

// @ts-ignore
import { loadCss, loadModules } from 'esri-loader';
import MapLayer from './MapLayer';

interface Props extends PanelProps<MapOptions> {}
interface State {
  // eslint-disable-next-line
}

export class MapPanel extends PureComponent<Props, State> {
  mapRef = React.createRef<HTMLDivElement>();

  componentDidMount() {
    const { options } = this.props;
    const {
      style,
      ethStatsSettings: { username, password, socketsUrl },
      mapSettings: { nodeMarkerColor },
    } = options;

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

      const options = {
        reconnectIntervalIncrement: 10000,
        maxReconnectInterval: 30000,
        maxReconnectAttempts: Infinity,
        heartbeatInterval: 60000,
      };

      const getNodeType = (name: string) => {
        const loweredName = name.toLowerCase();
        if (loweredName.indexOf('boot') >= 0) return 2;
        if (
          loweredName.indexOf('validator') >= 0 ||
          loweredName.indexOf('validador') >= 0 ||
          loweredName.indexOf('_val') >= 0
        )
          return 1;
        return 0;
      };

      const client = deepstream(socketsUrl, options).login({ username, password }, async success => {
        if (success) {
          // @ts-ignore
          const list = await client.record.getList('ethstats/nodes').whenReady();
          let i = 0;
          // @ts-ignore
          for (const entry of list.getEntries()) {
            // @ts-ignore
            const record = await client.record.getRecord(`${entry}/nodeData`).whenReady();
            // @ts-ignore
            const node = record.get()['ethstats:nodeData'];
            const point = node['geo:point'].split(' ');
            await layer.applyEdits({
              addFeatures: [
                {
                  geometry: new Point({ y: point[0], x: point[1] }),
                  attributes: {
                    ObjectID: i++,
                    name: node['ethstats:nodeName'],
                    active: node['ethstats:nodeIsActive'],
                    type: getNodeType(node['ethstats:nodeName']),
                    latency: node['ethstats:wsLatency'],
                    besu: node['ethstats:node'],
                    os: `${node['ethstats:os']}@${node['ethstats:osVersion']}`,
                    lon: point[1],
                    lat: point[0],
                  },
                },
              ],
            });
          }
        } else {
          console.error(new Error('There is no valid DeepStream instance'));
        }
        client.close();
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
