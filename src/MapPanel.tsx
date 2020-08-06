import React, { PureComponent } from 'react';
import { PanelProps } from '@grafana/data';
import { MapOptions } from './types';
import { css } from 'emotion';

// eslint-disable-next-line
import { WebMapView } from './WebMapView';

interface Props extends PanelProps<MapOptions> {}
interface State {
  // eslint-disable-next-line
}

export class MapPanel extends PureComponent<Props, State> {
  render() {
    const { options, width, height } = this.props;
    const {
      style,
      besuSettings: { ingressContractAddress, rpcUrl },
      mapSettings: { nodeMarkerColor },
    } = options;

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
        <WebMapView
          style={style}
          ingressContractAddress={ingressContractAddress}
          rpcUrl={rpcUrl}
          nodeMarkerColor={nodeMarkerColor}
        />
      </div>
    );
  }
}
