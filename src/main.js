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
    zoom: 13,
  })
});
console.log(map.getView().getResolution())

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

// DPI berechnen => Bildschirm abhängig
var DOTS_PER_INCH = 25.4 / 0.28; 
function getResolutionFromScale(scale, dpi){
    var units = map.getView().getProjection().getUnits();
    // var dpi = 25.4 / 0.28;
    var mpu = METERS_PER_UNIT[units];
    var resolution = scale/(mpu * 39.37 * dpi);
    return resolution;
}

var res = getResolutionFromScale(80000, DOTS_PER_INCH);
console.log(res);
map.getView().setResolution(res);
console.log(map.getView().getResolution())

function mapScale (dpi) {
  var unit = map.getView().getProjection().getUnits();
  var resolution = map.getView().getResolution();
  var inchesPerMetre = 39.37;

  return resolution * METERS_PER_UNIT[unit] * inchesPerMetre * dpi;
}

console.log(mapScale(DOTS_PER_INCH));
// https://gis.stackexchange.com/questions/242424/how-to-get-map-units-to-find-current-scale-in-openlayers

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