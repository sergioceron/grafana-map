import React from 'react';

import { PanelOptionsEditorBuilder, GrafanaTheme } from '@grafana/data';

import { MapOptions, MapStyle } from './types';
import { ColorPicker, Input, Icon, stylesFactory } from '@grafana/ui';
import { css } from 'emotion';
import { config } from '@grafana/runtime';

export const optionsBuilder = (builder: PanelOptionsEditorBuilder<MapOptions>) => {
  // Global options
  builder.addRadio({
    path: 'style',
    name: 'Style',
    settings: {
      options: [
        { value: MapStyle.dark, label: 'Dark' },
        { value: MapStyle.light, label: 'Light' },
      ],
    },
    defaultValue: MapStyle.dark,
  });
  // TODO: refreshSettings.syncWithDashboard

  addMapSettings(builder);
  addBesuSettings(builder);
};
//---------------------------------------------------------------------
// DATE FORMAT
//---------------------------------------------------------------------
function addMapSettings(builder: PanelOptionsEditorBuilder<MapOptions>) {
  const category = ['Map Options'];

  builder
    .addBooleanSwitch({
      category,
      path: 'mapSettings.checkStatus',
      name: 'Check Node Status',
      defaultValue: false,
    })
    .addTextInput({
      category,
      path: 'mapSettings.pingTime',
      name: 'Ping Time',
      settings: {
        placeholder: 'Ping time in seconds',
      },
      defaultValue: '60',
      showIf: s => s.mapSettings?.checkStatus,
    })
    .addCustomEditor({
      category,
      id: 'mapSettings.nodeMarkerColor',
      path: 'mapSettings.nodeMarkerColor',
      name: 'Node Marker Color',
      editor: props => {
        const styles = getStyles(config.theme);
        let prefix: React.ReactNode = null;
        let suffix: React.ReactNode = null;
        if (props.value) {
          suffix = <Icon className={styles.trashIcon} name="trash-alt" onClick={() => props.onChange(undefined)} />;
        }

        prefix = (
          <div className={styles.inputPrefix}>
            <div className={styles.colorPicker}>
              <ColorPicker
                color={props.value || config.theme.colors.panelBg}
                onChange={props.onChange}
                enableNamedColors={true}
              />
            </div>
          </div>
        );

        return (
          <div>
            <Input
              type="text"
              value={props.value || 'Pick Color'}
              onBlur={(v: any) => {
                console.log('CLICK');
              }}
              prefix={prefix}
              suffix={suffix}
              css={{ zIndex: 1 }}
            />
          </div>
        );
      },
      defaultValue: 'rgb(0,255,236)',
    });
}
//---------------------------------------------------------------------
// BESU SETTINGS
//---------------------------------------------------------------------
function addBesuSettings(builder: PanelOptionsEditorBuilder<MapOptions>) {
  const category = ['Besu Options'];

  builder
    .addTextInput({
      category,
      path: 'besuSettings.ingressContractAddress',
      name: 'Ingress Contract Address',
      defaultValue: '0x0000000000000000000000000000000000009999',
    })
    .addTextInput({
      category,
      path: 'besuSettings.rpcUrl',
      name: 'Besu RPC Url',
      defaultValue: 'http://35.184.61.29:4545',
    });
}

const getStyles = stylesFactory((theme: GrafanaTheme) => {
  return {
    colorPicker: css`
      padding: 0 ${theme.spacing.sm};
    `,
    inputPrefix: css`
      display: flex;
      align-items: center;
    `,
    trashIcon: css`
      color: ${theme.colors.textWeak};
      cursor: pointer;

      &:hover {
        color: ${theme.colors.text};
      }
    `,
  };
});
