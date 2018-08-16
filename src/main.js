import 'ol/ol.css';
import 'ol-layerswitcher/src/ol-layerswitcher.css';
import 'ol-popup/src/ol-popup.css';
import './styles.css';
// import 'babel-polyfill';
import PrintingMap, { DOTS_PER_INCH } from './Map';
import PrintService from './PrintService';
import PrintData from './PrintData';

// Test IdProjekt mit QGIS
let idProj = 1430;
let proj = document.querySelector("#IdProjekt");
if (proj) {
  idProj = proj.value;
}
// console.log("IdProj " + idProj);

let map = new PrintingMap(getLastPosition(), getLastZoom());
let templatesMap = null;
let scalesMap = null;
let selectedTemplate = null;
let selectedScale = null;
let printService = null;
let printData = new PrintData(idProj);
let selectedDpi = 96;

ready(function () {
  console.log("Karte ready!");
  console.log(DOTS_PER_INCH);
  console.log(process.env.KF_RB_URL);
  console.log("DPI Factor " + window.devicePixelRatio);
});

document.querySelector("#Druckeinstellungen").addEventListener("click", (evt) => {
  let templates = null;
  let scales = null;
  (async function () {
    printService = new PrintService();
    await printService.getApiAccessToken();
    templates = await printService.getTemplates();
    scales = await printService.getScales();
  })()
    .then(() => {
      // console.log("Templates");
      templatesMap = JSON.parse(templates);
      addTemplates(templatesMap);
      scalesMap = JSON.parse(scales);
      addScales(scalesMap);
    })
    .catch(e => { alert("Fehler - Verbindung mit Server"); console.error(e); });
});

document.querySelector("#Druckformate").addEventListener("change", function () {
  var elem = (typeof this.selectedIndex === "undefined" ? window.event.srcElement : this);
  var value = elem.value || elem.options[elem.selectedIndex].value;
  selectedTemplate = templatesMap.find(x => x.name === value);
  console.log(selectedTemplate);
  printData.set_template = selectedTemplate.name;
  if (!selectedScale || !selectedTemplate) {
    return;
  }

  map.removePrintLayer();
  map.addPrintLayer(
    selectedScale,
    scaleToPixel(selectedDpi, selectedTemplate.ComposerMap[0].width),
    scaleToPixel(selectedDpi, selectedTemplate.ComposerMap[0].height),
    selectedDpi
  );
});

document.querySelector("#Masstab").addEventListener("change", function () {
  var elem = (typeof this.selectedIndex === "undefined" ? window.event.srcElement : this);
  var value = elem.value || elem.options[elem.selectedIndex].value;
  selectedScale = scalesMap.find(x => x === parseInt(value));
  console.log(selectedScale);
  printData.set_scale = selectedScale;
  if (!selectedScale || !selectedTemplate) {
    return;
  }

  map.removePrintLayer();
  map.addPrintLayer(
    selectedScale,
    scaleToPixel(selectedDpi, selectedTemplate.ComposerMap[0].width),
    scaleToPixel(selectedDpi, selectedTemplate.ComposerMap[0].height),
    selectedDpi
  );
});

document.querySelector("#KartenDruck").addEventListener("click", (evt) => {
  // Extents von Druckrahmen  
  // console.log(map.selectedPrintFeatures);
  if (!map.selectedPrintFeatures) {
    return;
  }
  // console.log(map.extentsPrint);
  let printDataArr = [];
  map.selectedPrintFeatures.forEach((printExt) => {
    printData.set_extents = printExt;
    printDataArr.push(printData.toJSON());
  });

  // console.log(printDataArr);
  (async function () {
    await printService.postPrintData(printDataArr);
  })()
    .then(() => {
      alert("Erfolgreich - Druck abgeschlossen")
    })
    .catch(e => { alert("Fehler beim Drucken"); console.error(e); });
});

function addTemplates(templates) {
  // console.log(templates);
  document.querySelector("#Druckformate").innerHTML = "";
  if (!templates || templates.length === 0) {
    document.querySelector("#Druckformate").innerHTML = '<option value="">Keine Templates vorhanden</option>';
    return;
  }
  var opt = document.createElement("option");
  opt.text = "Bitte Template auswählen";
  opt.value = "";
  var select = document.querySelector("#Druckformate");
  select.appendChild(opt);

  forEach(templates, (key, value, obj) => {
    const option = document.createElement("option");
    option.text = value.name;
    option.value = value.name;
    select.appendChild(option);
  });
}

function addScales(scales) {
  // console.log(scales);
  document.querySelector("#Masstab").innerHTML = "";
  if (!scales || scales.length === 0) {
    document.querySelector("#Masstab").innerHTML = '<option value="">Kein Maßstab vorhanden</option>';
    return;
  }
  var opt = document.createElement("option");
  opt.text = "Bitte Maßstab auswählen";
  opt.value = "";
  var select = document.querySelector("#Masstab");
  select.appendChild(opt);

  forEach(scales, (key, value, obj) => {
    const option = document.createElement("option");
    option.text = value;
    option.value = value;
    select.appendChild(option);
  });
}

function scaleToPixel(dpi, value) {
  const dim = parseInt(value);
  return Math.round(dpi * dim / 25.4);
}

function getLastPosition() {
  let lastPosition = document.querySelector("#Position");
  if (lastPosition) {
    return lastPosition.value;
  }

  return 'POINT(12.2958 50.6231)';
}

function getLastZoom() {
  let lastZoom = document.querySelector("#Zoom");
  if (lastZoom) {
    return lastZoom.value;
  }

  return 12;
}

// forEach(obj, (key, value, obj ) => {
//   console.log(key, value, obj );
// });
const forEach = function (obj, fn) {
  for (const keyValuePair of Object.entries(obj)) {
    fn(...keyValuePair, obj);
  }
};

function ready(callback) {
  // in case the document is already rendered
  if (document.readyState !== "loading") {
    callback();
  } else if (document.addEventListener) {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    document.addEventListener("onreadystatechange", function () {
      if (document.readyState === "complete") {
        callback();
      }
    });
  }
}

  // const data = { id: '1', id_wildart: '18', datum: '01.07.2018', ort: "Riesa"};
  // connection.postStreckeDaten(data, tokens['access_token']);  

  // let templates = null;
  // (async function () {
  //   const webApiUrl = 'http://localhost:55555/Token';
  //   const connection = new WebApiConnection(webApiUrl);
  //   const tokens = await connection.getAccessToken();
  //   // console.log("Tokens");
  //   // console.log(tokens['access_token']);   
  //   const config = new PrintConfig(tokens['access_token']);
  //   templates = await config.listTemplates();
  // })()
  //   .catch(e => { console.error("Fehler"); console.error(e); })
  //   .then(() => {
  //     console.log("Templates");
  //     console.log(JSON.parse(templates));
  //   });

  // var url = 'http://localhost:55555/Token';
  // const loginData = {
  //   grant_type: 'password',
  //   username: 'admin@example.de',
  //   password: 'Admin+1'
  // };

  // $.ajax({
  //   type: 'POST',
  //   url: url,
  //   data: loginData,
  //   async: true
  // }).done(function (data) {
  //   console.log(data);
  // }).fail(function (jqXHR, textStatus) {
  //   alert('login problem')
  // });



// // 'use strict'; 
// import { Map, View } from 'ol';
// import TileLayer from 'ol/layer/Tile';
// import OSM from 'ol/source/OSM';
// // import XYZ from 'ol/source/xyz';
// // import Proj from 'ol/proj';
// import { addProjection, addCoordinateTransforms, transform, get, METERS_PER_UNIT } from 'ol/proj.js';
// import Group from 'ol/layer/Group';
// import LayerSwitcher from 'ol-layerswitcher';
// import Popup from 'ol-popup';
// // import Coordinate from 'ol/coordinate';
// import { toStringHDMS } from 'ol/coordinate';
// import SachsenDop from './SachsenWmsDopLayer';
// import VectorLayer from 'ol/layer/Vector.js';
// import VectorSource from 'ol/source/Vector.js';
// // import Polygon from 'ol/geom/Polygon';
// // import * as ol from 'ol';
// import { fromExtent } from 'ol/geom/Polygon.js';
// import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style.js';
// import Feature from 'ol/Feature.js';
// import { defaults as defaultControls } from 'ol/control.js';
// import MousePosition from 'ol/control/MousePosition.js';
// import { createStringXY } from 'ol/coordinate.js';

// const mousePositionControl = new MousePosition({
//   coordinateFormat: createStringXY(4),
//   projection: 'EPSG:4326',
//   undefinedHTML: 'außerhalb',
// });

// const map = new Map({
//   controls: defaultControls({ attributionOptions: { collapsible: true } }).extend([mousePositionControl]),
//   target: 'map',
//   layers: [new Group({
//     'title': 'Base maps',
//     layers: [
//       new TileLayer({
//         title: 'OSM',
//         type: 'base',
//         visible: true,
//         source: new OSM()
//       }), new SachsenDop()]
//   })],
//   view: new View({
//     center: transform([12.2958, 50.6231], "EPSG:4326", "EPSG:3857"),
//     projection: get("EPSG:3857"),
//     //resolution: 100   
//     zoom: 13,
//   })
// });
// console.log("map res " + map.getView().getResolution());

// var layerSwitcher = new LayerSwitcher({
//   tipLabel: 'Legende' // Optional label for button
// });
// map.addControl(layerSwitcher);

// var popup = new Popup();
// map.addOverlay(popup);

// map.on('singleclick', function (evt) {
//   //alert("Test");
//   var prettyCoord = toStringHDMS(transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326'), 2);
//   popup.show(evt.coordinate, '<div><h2>Coordinates</h2><p>' + prettyCoord + '</p></div>');
// });

// console.log("DPI Factor " + window.devicePixelRatio);

// // DPI berechnen => Bildschirm abhängig
// var DOTS_PER_INCH = 96; // * window.devicePixelRatio; // PixelRatio == 1
// function getResolutionFromScale(scale, dpi) {
//   var units = map.getView().getProjection().getUnits();
//   var mpu = METERS_PER_UNIT[units];
//   var resolution = scale / (mpu * 39.37 * dpi);
//   return resolution;
// }
// // Karte Maßstab setzen
// // map.getView().setResolution(getResolutionFromScale(80000, DOTS_PER_INCH));

// // console.log("resolutionFromScale " + res);
// // map.getView().setResolution(res);
// // console.log(map.getView().getResolution())

// function mapScale(dpi, res) {
//   var unit = map.getView().getProjection().getUnits();
//   var resolution = res;
//   var inchesPerMetre = 39.37;

//   return resolution * METERS_PER_UNIT[unit] * inchesPerMetre * dpi;
// }

// console.log("Scale MAP  " + mapScale(DOTS_PER_INCH, map.getView().getResolution()));

// // Druckbereich, Maßstab 1 : 50.000
// var res = getResolutionFromScale(50000, DOTS_PER_INCH);
// const printSource = new VectorSource({
//   wrapX: false,
//   features: [],
// });
// const printLayer = new VectorLayer({
//   source: printSource,
//   style: new Style({
//     stroke: new Stroke({
//       color: 'rgba(255, 0, 0, 1.0)',
//       width: 2
//     })
//   })
// });
// map.addLayer(printLayer);

// function onMoveEnd(evt) {
//   console.log("MoveEnd");
//   printSource.clear();
//   console.log("Center " + map.getView().getCenter())
//   let newView = new View({
//     center: map.getView().getCenter(),
//     projection: get("EPSG:3857"),
//     resolution: res
//   });

//   console.log("Kontrolle Scale View " + mapScale(DOTS_PER_INCH, res));
//   // TODO: Übergabe Druckbereich in Pixel
//   const ext = newView.calculateExtent([462, 445]);
//   console.log(ext);
//   //var ext = map.getView().calculateExtent(map.getSize());
//   const feature = new Feature({
//     'geometry': fromExtent(ext)
//   });
//   printSource.addFeature(feature);  
// }

// map.on('moveend', onMoveEnd);



// Tests
// const app = (a, b) => {
//   return a + b;
// }
// console.log(app(4,5));



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


// 

// async function list1() {
//   const resp = await request('https://geodienste.sachsen.de/wms_geosn_dop-rgb/guest?REQUEST=GetCapabilities&SERVICE=WMS');
//   console.log(resp);
// }
// list1();