import ClusterPopup from './ClusterPopup';

const clusterPopup = new ClusterPopup();

export default class MapLayer {
  private readonly markerColor: string;

  constructor(markerColor: string) {
    this.markerColor = markerColor;
  }

  getLayer() {
    return {
      objectIdField: 'ObjectID',
      geometryType: 'point',
      fields: [
        {
          name: 'ObjectID',
          alias: 'ObjectID',
          type: 'oid',
        },
        {
          name: 'type',
          alias: 'type',
          type: 'integer',
        },
        {
          name: 'lon',
          alias: 'lon',
          type: 'double',
        },
        {
          name: 'lat',
          alias: 'lat',
          type: 'double',
        },
        {
          name: 'ip',
          alias: 'ip',
          type: 'string',
        },
      ],
      source: [],
      outFields: ['*'],
      popupTemplate: {
        title: () => {
          return 'Node';
        },
        outFields: ['*'],
        content: async (feature: any) => {
          return clusterPopup.render(feature);
        },
      },
      renderer: {
        type: 'simple',
        symbol: {
          type: 'simple-marker',
          style: 'circle',
          color: this.markerColor,
          outline: {
            color: [0, 0, 0, 0.3],
            width: 0.5,
          },
          angle: 180,
          size: 5,
        },
        visualVariables: [
          {
            type: 'color',
            field: 'type',
            stops: [
              {
                value: 1,
                color: 'rgba(33, 66, 99, 0.6)',
                label: 'dffdaa',
              },
            ],
          },
        ],
      },
      spatialReference: {
        wkid: 4326,
      },
    };
  }
}
