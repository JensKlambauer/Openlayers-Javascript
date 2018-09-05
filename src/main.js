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

let map = new PrintingMap(getLastPosition(), getLastZoom(), idProj);
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
      map.disableIntact();
      map.addFeaturesUser(printService);
    })
    .catch(e => { alert("Fehler - Verbindung mit Server"); console.error(e); });
});

document.querySelector("#Druckformate").addEventListener("change", function () {
  var elem = (typeof this.selectedIndex === "undefined" ? window.event.srcElement : this);
  var value = elem.value || elem.options[elem.selectedIndex].value;
  selectedTemplate = templatesMap.find(x => x.name === value);
  // console.log(selectedTemplate);
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
  // console.log(selectedScale);
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
  if (!map.selectedPrintFeatures || map.selectedPrintFeatures.length === 0) {
    alert("Bitte mindestens einen Druckbereich auswählen.")
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

/**   
  *
  * @param {Array} templates The Map Templates.
  * 
  */
function addTemplates(templates) {
  // console.log(templates);
  const templateSelect = document.querySelector("#Druckformate");
  if (!templates || templates.length === 0) {
    templateSelect.innerHTML = '<option value="">Keine Templates vorhanden</option>';
    return;
  }

  templateSelect.innerHTML = '';

  const opt = document.createElement("option");
  opt.text = "Bitte Template auswählen";
  opt.value = "";
  templateSelect.add(opt);

  templates.forEach(template => {
    const option = document.createElement('option');
    option.text = template.name;
    option.value = template.name;
    templateSelect.add(option);
  });
}

/**   
  *
  * @param {Array} scales The Map Scales.
  * 
  */
function addScales(scales) {
  // console.log(scales);
  const scaleSelect = document.querySelector("#Masstab");
  if (!scales || scales.length === 0) {
    scaleSelect.innerHTML = '<option value="">Kein Maßstab vorhanden</option>';
    return;
  }

  scaleSelect.innerHTML = '';

  const opt = document.createElement("option");
  opt.text = "Bitte Maßstab auswählen";
  opt.value = "";
  scaleSelect.add(opt);

  scales.forEach(scale => {
    const option = document.createElement('option');
    option.text = scale;
    option.value = scale;
    scaleSelect.add(option);
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
// const forEach = function (obj, fn) {
//   for (const keyValuePair of Object.entries(obj)) {
//     fn(...keyValuePair, obj);
//   }
// };

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