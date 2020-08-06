import React, { useEffect, useRef } from 'react';
import ethers from 'ethers';
// @ts-ignore
import request from 'request';
import { loadCss, loadModules } from 'esri-loader';
import { MapStyle } from './types';
import MapLayer from './MapLayer';
// @ts-ignore
import nodeIngressABI from './contracts/NodeIngress.json';
// @ts-ignore
import nodeListABI from './contracts/NodeList.json';

const ipv4Prefix = '00000000000000000000ffff';

const getIPLocation = (ip: string) =>
  new Promise(resolve => {
    let url = `http://api.ipstack.com/${ip}?access_key=67332e46b2ec77d406cffe607d152297`;
    request(
      {
        url: url,
        method: 'GET',
        json: true,
      },
      (error: any, response: any, body: any) => {
        if (response.statusCode !== 200) {
          resolve('FAILED');
        }

        if (body.success === false) {
          resolve('LIMIT_REACHED');
        }

        if (typeof body.latitude !== 'undefined') {
          resolve({ latitude: body.latitude, longitude: body.longitude });
        }
        resolve('FAILED');
      }
    );
  });

const splitAddress = (address: string, digits: number) => {
  const bits: string[] = [];

  while (address.length >= digits) {
    bits.push(address.slice(0, digits));
    address = address.slice(digits);
  }
  return bits;
};

const getIpv4 = (address: string) => {
  return splitAddress(address.split(ipv4Prefix)[1], 2)
    .map(hex => {
      return parseInt(hex, 16);
    })
    .join('.');
};

export const WebMapView = (props: any) => {
  const mapRef = useRef();
  const nodeIngress = new ethers.Contract(
    props.ingressContractAddress,
    nodeIngressABI,
    new ethers.providers.JsonRpcProvider(props.rpcUrl)
  );

  useEffect(() => {
    // lazy load the required ArcGIS API for JavaScript modules and CSS
    loadCss(`https://js.arcgis.com/4.16/esri/themes/${props.style}/main.css`, 'style');
    loadModules(['esri/Map', 'esri/views/MapView', 'esri/layers/FeatureLayer', 'esri/geometry/Point'], {
      css: false,
    }).then(([ArcGISMap, MapView, FeatureLayer, Point]) => {
      const map = new ArcGISMap({
        basemap: props.style === MapStyle.dark ? 'dark-gray' : 'gray',
      });

      // load the map view at the ref's DOM node
      const view = new MapView({
        container: mapRef.current,
        map: map,
        center: [0, 34],
        zoom: 2,
      });
      const mapLayer = new MapLayer(props.nodeMarkerColor);
      const layer = new FeatureLayer(mapLayer.getLayer());
      map.add(layer);

      nodeIngress
        .getContractAddress('0x72756c6573000000000000000000000000000000000000000000000000000000')
        .then(async (address: string) => {
          const nodeList = new ethers.Contract(
            address,
            nodeListABI,
            new ethers.providers.JsonRpcProvider(props.rpcUrl)
          );
          const size = parseInt(await nodeList.getSize(), 10);
          for (let i = 1; i < size; i++) {
            nodeList.getByIndex(i).then(async (whitelist: any) => {
              const ipHex = whitelist[2];
              const ip = getIpv4(ipHex.split('x')[1]);
              console.log(
                'enode://' +
                  whitelist[0].replace('0x', '') +
                  whitelist[1].replace('0x', '') +
                  '@' +
                  ip +
                  ':' +
                  whitelist[3]
              );
              // @ts-ignore
              const { longitude, latitude } = await getIPLocation(ip);
              await layer.applyEdits({
                addFeatures: [
                  {
                    geometry: new Point({ y: latitude, x: longitude }),
                    attributes: { ObjectID: i, ip, lon: longitude, lat: latitude },
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
  });

  // @ts-ignore
  return <div className="webmap" style={{ width: '100%', height: '300px', backgroundColor: '#FFF' }} ref={mapRef} />;
};
