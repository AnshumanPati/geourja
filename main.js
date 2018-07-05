// var treee;
import 'ol/ol.css';
import GeoJSON from 'ol/format/GeoJSON';
import Map from 'ol/Map';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import View from 'ol/View';
import sync from 'ol-hashed';
import DragAndDrop from 'ol/interaction/DragAndDrop';
import Modify from 'ol/interaction/Modify';
import Draw from 'ol/interaction/Draw';
import Snap from 'ol/interaction/Snap';
import {Circle,Fill,Stroke,Style,Text} from 'ol/style';
 
//custom imports

// import * as _ from 'underscore';
 import * as $ from 'jquery';
// import * as algo from './algo.js';

$.getJSON('./data/lines2.json', function(data) {
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
    $.getJSON('./data/points2.json', function(data) {
      var obj_point = data;
      var feature_list_points = obj_point.features;
      // var window.treee;
        for( var i=0;i<no_of_feeder_id.length;i++){
          // var window.treee;
           window.treee = createTree(no_of_feeder_id[i].properties.feeder_id,grouped_list,feature_list_points);
          //window.key_value = createTreeValuePair(no_of_feeder_id[i].properties.feeder_id,grouped_list,feature_list_points);
           console.log(window.treee);
        }
    });
    
});

const source = new VectorSource({
        format: new GeoJSON(),
        url: './data/points2.json'
      });

const source2 = new VectorSource({
        format: new GeoJSON(),
        url: './data/lines2.json'
      });

// var fill = new Fill({
//    color: 'grey'
//  });

// var stroke = new Stroke({
//    color: 'blue',
//    width: 1.25
//  });

// var style = new Style({
//  stroke: stroke,
//  fill: fill
// });

const layer = new VectorLayer({
  source: source,
  style : pointStyleFunction
});
// console.log(layer.getProperties().source);
const layer2 = new VectorLayer({
  source: source2 
  // style: style
});


const map = new Map({
  target: 'map-container',
  layers: [ layer , layer2 ],
  source: source,
  view: new View({
    center: [23.159651487732,72.6410812139511],
    zoom: 3
  })
});

// console.log(layer.getKeys());

// map.addInteraction(new DragAndDrop({
//   source: source,
//   formatConstructors: [GeoJSON]
// }));
// map.addInteraction(new Draw({
//   type: 'Polygon',
//   source: source
// }));
// map.addInteraction(new Modify({
//   source: source
// }));
map.addInteraction(new Snap({
  source: source
}));
sync(map);

const clear = document.getElementById('clear');
clear.addEventListener('click', function() {
  source.clear();
});

document.getElementById('points-text')
    .addEventListener('click', function() {
    layer.setStyle(pointStyleFunction);
});

var myDom ={
  points:
  {
    text: document.getElementById('points-text'),
    font:'Arial',
    weight:'Normal',
    size:'12px' 
  }
}
var getText=function(feature,type)
{
  var text = '';//window.treee.search(feature.values_.id);
  // console.log(feature.values_.id);
  if(type== 'km')
  {
       function assign(node){
        text = "\n" + node.km;
      }
     window.treee.search(feature.values_.id,assign);
  }
  else if(type == 'kva')
  {
   function assign(node){
        text = "\n" + node.kv;
      }
     window.treee.search(feature.values_.id,assign);
  }
  else if(type == 'km*kva')
  {
   function assign(node){
        text = "\n" + node.prod;
      }
     window.treee.search(feature.values_.id,assign);
  }
  else if(type == 'type')
  {
   function assign(node){
      // console.log(node.capacity);
      if(node.capacity == null ){
        text = "\n" + "P";
      }
      else 
        text = "\n" + "T";
      }
     window.treee.search(feature.values_.id,assign);
  }
  else if(type == 'id')
  {
      function assign(node){
        text = "\n" + node.rename;
      }
      if(typeof window.treee !== 'undefined'){
          window.treee.search(feature.values_.id,assign);
        }
      else{

      }
  }
  return text;
};

var createTextStyle = function(feature,dom)
{
  var font=dom.font + ' ' + dom.weight + ' ' + dom.size;
  return new Text({
    font: font,
    text:getText(feature,dom.text.value),
  });
};
function pointStyleFunction(feature) {
        return new Style({
          image: new Circle({
            radius: 5,
            fill: new Fill({color: 'rgba(0, 255, 0, 0.1)'}),
            stroke: new Stroke({color: 'blue', width: 1})
          }),
          text: createTextStyle(feature,myDom.points)
        });
      }

const format = new GeoJSON({featureProjection: 'EPSG:3857'});
const download = document.getElementById('download');
source.on('change', function() {
  const features = source.getFeatures();
  // console.log(features);
  const json = format.writeFeatures(features);
  download.href = 'data:text/json;charset=utf-8,' + json;
});

map.on("click", function(e) {
    map.forEachFeatureAtPixel(e.pixel, function (feature, layer) {
        console.log(feature.values_);
        var text;
        function assign(node){
          // console.log(node.rename);
          text = node.rename;
        }     
        window.treee.search(feature.values_.id,assign);
        document.getElementById("name").innerHTML = text;
        //do something
    })
});
// console.log(rows.length);

//feture . on click
// navigator.geolocation.getCurrentPosition(
//   function(pos) { 
//    const coords = fromLonLat([72.6410812139511,23.159651487732]); 
//    map.getView().animate({center: coords, zoom: 10}); });