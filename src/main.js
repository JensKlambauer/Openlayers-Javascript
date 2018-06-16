import 'ol/ol.css';
import 'ol-layerswitcher/src/ol-layerswitcher.css';
import 'ol-popup/src/ol-popup.css';
import "./styles.css";
import Map from 'ol/map';
import View from 'ol/view';
import TileLayer from 'ol/layer/tile';
//import XYZ from 'ol/source/xyz';
import Osm from 'ol/source/osm';
import Proj from 'ol/proj';
import Group from 'ol/layer/group';
import LayerSwitcher from 'ol-layerswitcher';
import Popup from 'ol-popup';
import Coordinate from 'ol/coordinate';

const map = new Map({
  target: 'map',
  layers: [new Group({
    'title': 'Base maps',
    layers: [
      new TileLayer({
        title: 'OSM',
        type: 'base',
        visible: true,
        source: new Osm()
      })]
  })],
  view: new View({
    center: Proj.transform([13.2856, 51.2986], "EPSG:4326", "EPSG:3857"),
    projection: Proj.get("EPSG:3857"),
    zoom: 12,
  })
});

var layerSwitcher = new LayerSwitcher({
  tipLabel: 'Legende' // Optional label for button
});
map.addControl(layerSwitcher);

var popup = new Popup();
map.addOverlay(popup);

map.on('singleclick', function (evt) {
  //alert("Test");
  var prettyCoord = Coordinate.toStringHDMS(Proj.transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326'), 2);
  popup.show(evt.coordinate, '<div><h2>Coordinates</h2><p>' + prettyCoord + '</p></div>');
});

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

// list().catch(e => {console.error("Error"); console.error(e);})