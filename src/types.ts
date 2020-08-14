export interface MapOptions {
  style: MapStyle;
  mapSettings: MapSettings;
  ethStatsSettings: EthStatsSettings;
}

export enum MapStyle {
  dark = 'dark',
  light = 'light',
}

interface MapSettings {
  checkStatus: boolean;
  pingTime: string;
  nodeMarkerColor: string;
}

interface EthStatsSettings {
  username: string;
  password: string;
  socketsUrl: string;
}
