import 'ol/ol.css';
import 'ol-layerswitcher/src/ol-layerswitcher.css';
import 'ol-popup/src/ol-popup.css';
import './styles.css';
// 'use strict'; 
import {Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
//import XYZ from 'ol/source/xyz';
// import Proj from 'ol/proj';
import {addProjection, addCoordinateTransforms, transform, get, METERS_PER_UNIT} from 'ol/proj.js';
import Group from 'ol/layer/Group';
import LayerSwitcher from 'ol-layerswitcher';
import Popup from 'ol-popup';
// import Coordinate from 'ol/coordinate';
import {toStringHDMS} from 'ol/coordinate';
import SachsenDop from './SachsenWmsDopLayer';
import VectorLayer from 'ol/layer/Vector.js';
import VectorSource from 'ol/source/Vector.js';
// import Polygon from 'ol/geom/Polygon';
// import * as ol from 'ol';
import { fromExtent } from 'ol/geom/Polygon.js';
import {Circle as CircleStyle, Fill, Stroke, Style} from 'ol/style.js';
import Feature from 'ol/Feature.js';

const map = new Map({
  target: 'map',
  layers: [new Group({
    'title': 'Base maps',
    layers: [
      new TileLayer({
        title: 'OSM',
        type: 'base',
        visible: true,
        source: new OSM()
      }), new SachsenDop()]
  })],
  view: new View({
    center: transform([13.2856, 51.2986], "EPSG:4326", "EPSG:3857"),
    projection: get("EPSG:3857"),
    //resolution: 100   
    zoom: 15,
  })
});
console.log("map res " + map.getView().getResolution());

var layerSwitcher = new LayerSwitcher({
  tipLabel: 'Legende' // Optional label for button
});
map.addControl(layerSwitcher);

var popup = new Popup();
map.addOverlay(popup);

map.on('singleclick', function (evt) {
  //alert("Test");
  var prettyCoord = toStringHDMS(transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326'), 2);
  popup.show(evt.coordinate, '<div><h2>Coordinates</h2><p>' + prettyCoord + '</p></div>');
});

console.log("DPI " + window.devicePixelRatio);

// DPI berechnen => Bildschirm abhängig
//var DOTS_PER_INCH = 25.4 / 0.28; 
var DOTS_PER_INCH = 96 * window.devicePixelRatio; // PixelRatio == 1
function getResolutionFromScale(scale, dpi){
    var units = map.getView().getProjection().getUnits();
    var mpu = METERS_PER_UNIT[units];
    var resolution = scale/(mpu * 39.37 * dpi);
    return resolution;
}

var res = getResolutionFromScale(25000, DOTS_PER_INCH);
console.log("resolutionFromScale " + res);
// map.getView().setResolution(res);
// console.log(map.getView().getResolution())

function mapScale (dpi, res) {
  var unit = map.getView().getProjection().getUnits();
  var resolution = res;
  var inchesPerMetre = 39.37;

  return resolution * METERS_PER_UNIT[unit] * inchesPerMetre * dpi;
}

console.log("Scale MAP  " + mapScale(DOTS_PER_INCH, map.getView().getResolution()));
// https://gis.stackexchange.com/questions/242424/how-to-get-map-units-to-find-current-scale-in-openlayers

let newView = new View({
     center: transform([13.2856, 51.2986], "EPSG:4326", "EPSG:3857"),
     projection: get("EPSG:3857"),
     resolution: res
  });
  console.log(newView.calculateExtent());
  console.log("Scale View " + mapScale(DOTS_PER_INCH, res));

  const ext = newView.calculateExtent();
  // var ext = map.getView().calculateExtent(map.getSize());
  var feature = new Feature({   
    'geometry': fromExtent(ext)
   });
  const vectorLayer = new VectorLayer({
    source: new VectorSource({
      wrapX: false,
      features: [feature],
    }),
    style: new Style({
      stroke: new Stroke({
        color: 'rgba(255, 0, 0, 1.0)',
        width: 2
      })
    })
  });
  map.addLayer(vectorLayer);


// const app = (a, b) => {
//   return a + b;
// }

// console.log(app(4,5));

function request(url) {
  return new Promise(function (resolve, reject) {
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function (e) {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          resolve(xhr.response)
        } else {
          reject({
            status: this.status,
            statusText: xhr.statusText
          });
        }
      }
    }
    xhr.ontimeout = function () {
      reject('timeout')
    }
    xhr.open('get', url, true)
    xhr.send()
  })
}

function handleRepoList(user, repos) {
  const userRepos = JSON.parse(repos)

  // Handle each individual user repo here
  console.log(user, userRepos)
}

async function list() {
  const userGet = `https://api.github.com/search/users?page=1&q=jensklambauer&type=Users`;

  const users = await request(userGet);
  console.log(users)
  const usersList = JSON.parse(users).items;

  usersList.forEach(async function (user) {
    const repos = await request(user.repos_url)

    handleRepoList(user, repos)
  })
}

// import WMTSCapabilities from 'ol/format/wmtscapabilities';
// import WMSCapabilities from 'ol/format/wmscapabilities';

// http://sg.geodatenzentrum.de/wms_vg250?request=GetCapabilities&service=wms
// https://geodienste.sachsen.de/wms_geosn_dop-rgb/guest?REQUEST=GetCapabilities&SERVICE=WMS
// var myHeaders = new Headers();
// myHeaders.append("Content-Type", "application/xml");

// var parser = new WMSCapabilities();
// fetch('https://geodienste.sachsen.de/wms_geosn_dop-rgb/guest?REQUEST=GetCapabilities&SERVICE=WMS',
// {
//   mode: 'no-cors'
// }).then(function(response) {
//   return response.text();
// }).then(function(text) { 
//   var result = parser.read(text);
//   console.log( JSON.stringify(result, null, 2));
// });

// var parser = new WMTSCapabilities();
// fetch('https://geoportal.sachsen.de/portal/arcgis_wmts_capabilities/wmts_geosn_dop-rgb.xml', {
//   // mode: 'no-cors', 
//   headers : myHeaders,
// }).then(function(response) {  
//   return response.text();
// }).then(function(text) {
//   console.log("text");
//   console.log(text);
//   var result = parser.read(text);
//   console.log( JSON.stringify(result, null, 2));
// });


// list().catch(e => {console.error("Error"); console.error(e);})

// async function list1() {
//   const resp = await request('https://geodienste.sachsen.de/wms_geosn_dop-rgb/guest?REQUEST=GetCapabilities&SERVICE=WMS');
//   console.log(resp);
// }
// list1();