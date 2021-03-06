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
          name: 'nodeType',
          alias: 'nodeType',
          type: 'string',
        },
        {
          name: 'name',
          alias: 'name',
          type: 'string',
        },
        {
          name: 'organization',
          alias: 'organization',
          type: 'string',
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
        title: (feature: any) => {
          return '<b>' + feature.graphic.attributes.name + '</b>';
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
            field: 'nodeType',
            stops: [
              {
                value: 0,
                color: 'rgb(0,233,225)',
                label: 'bootnode',
              },
              {
                value: 1,
                color: 'rgb(248,229,37)',
                label: 'validator',
              },
              {
                value: 2,
                color: 'rgb(200,70,255)',
                label: 'writer',
              },
              {
                value: 3,
                color: 'rgb(188,187,187)',
                label: 'observer',
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
