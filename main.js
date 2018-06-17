import 'ol/ol.css';
import GeoJSON from 'ol/format/GeoJSON';
import Map from 'ol/Map';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import View from 'ol/View';
import {fromLonLat} from 'ol/proj';

const line_layer =     new VectorLayer({
      source: new VectorSource({
        format: new GeoJSON(),
        url: './lines.json'
      })
    })
const points_layer =     new VectorLayer({
      source: new VectorSource({
        format: new GeoJSON(),
        url: './points.json'
      })
    })
const map = new Map({
  target: 'map-container',
  layers: [ line_layer, points_layer  ],
  view: new View({
    center: [0, 0],
    zoom: 2
  })
});
navigator.geolocation.getCurrentPosition(function(pos) {
  const coords = fromLonLat([pos.coords.longitude, pos.coords.latitude]);
  map.getView().animate({center: coords, zoom: 10});
});