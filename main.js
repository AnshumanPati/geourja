import 'ol/ol.css';
import GeoJSON from 'ol/format/GeoJSON';
import Map from 'ol/Map';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import View from 'ol/View';
import DragAndDrop from 'ol/interaction/DragAndDrop';
import {fromLonLat} from 'ol/proj';
import Feature from 'ol/feature';
import Modify from 'ol/interaction/Modify';
import Draw from 'ol/interaction/Draw';
// import createTree from './algo.js';
import * as _ from 'underscore';
import 'jquery';

//import Tree from './algo.js';
//import Snap from 'ol/interaction/Snap';

 const source = new VectorSource({
    format: new GeoJSON(),
    url: './lines.json'
  })

const line_layer = new VectorLayer({
  source: source
    })
//console.log(line_layer.getProperties());
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
// var stroke = new Stroke({
//  width: 50
//S });
// var style = new Style({
//  stroke: stroke
// })
// navigator.geolocation.getCurrentPosition(function(pos) {
//   const coords = fromLonLat([pos.coords.longitude, pos.coords.latitude]);
//   map.getView().animate({center: coords, zoom: 10});
// });
const clear = document.getElementById('clear');
clear.addEventListener('click', function() {
  source.clear();
});
const format = new GeoJSON({featureProjection: 'EPSG:3857'});
const download = document.getElementById('download');
source.on('change', function() {
  const features = source.getFeatures();
  const json = format.writeFeatures(features);
  download.href = 'data:text/json;charset=utf-8,' + json;
});
map.on("click", function(e) {
    map.forEachFeatureAtPixel(e.pixel, function (feature, layer) {
        console.log(feature.values_);
        document.getElementById("name").innerHTML = feature.values_.location_str;
        //do something
    })
});

$.getJSON('./lines.json', function(data) {
    var obj = data;
    var feature_list = obj.features;
    var sorted_list = _.sortBy(feature_list, function(feature){
    // return "" + feature.properties.feeder_id + feature.properties.start_point
    return feature.properties.id
    })
    var grouped_list = _.groupBy(sorted_list,function(feature){
    return feature.properties.feeder_id
    })
    var no_of_feeder_id = _.uniq(sorted_list,true,function(feature){
    return feature.properties.feeder_id
    })
    for( var i=0;i<no_of_feeder_id.length;i++){
    createTree(no_of_feeder_id[i].properties.feeder_id,grouped_list);
    }
});

$.getJSON('./points.json', function(data) {
    var obj_point = data;
    var feature_list_points = obj_point.features;
});


// document.addEventListener("click", function(){
//     document.getElementById("demo").innerHTML = "Hello World";
// });
/*map.addInteraction(new Modify({
  source: source
}));
map.addInteraction(new Draw({
  type: 'Polygon',
  source: source
}));
map.addInteraction(new Snap({
  source: source
}));*/