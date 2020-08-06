import { PanelPlugin } from '@grafana/data';

import { MapPanel } from './MapPanel';
import { MapOptions } from './types';
import { optionsBuilder } from './options';

export const plugin = new PanelPlugin<MapOptions>(MapPanel).setNoPadding().setPanelOptions(optionsBuilder);
