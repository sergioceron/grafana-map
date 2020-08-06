export interface MapOptions {
  style: MapStyle;
  mapSettings: MapSettings;
  besuSettings: BesuSettings;
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

interface BesuSettings {
  ingressContractAddress: string;
  rpcUrl: string;
}
