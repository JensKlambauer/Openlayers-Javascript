import { Map, View, Observable } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
//import XYZ from 'ol/source/xyz';
// import Proj from 'ol/proj';
import { addProjection, addCoordinateTransforms, transform, get, METERS_PER_UNIT } from 'ol/proj.js';
import Group from 'ol/layer/Group';
import LayerSwitcher from 'ol-layerswitcher';
import Popup from 'ol-popup';
// import Coordinate from 'ol/coordinate';
import { toStringHDMS } from 'ol/coordinate';
import SachsenDop from './SachsenWmsDopLayer';
import VectorLayer from 'ol/layer/Vector.js';
import VectorSource from 'ol/source/Vector.js';
// import Polygon from 'ol/geom/Polygon';
// import * as ol from 'ol';
import { fromExtent } from 'ol/geom/Polygon.js';
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style.js';
import Feature from 'ol/Feature.js';
import { defaults as defaultControls } from 'ol/control.js';
import MousePosition from 'ol/control/MousePosition.js';
import { createStringXY } from 'ol/coordinate.js';
import { unByKey } from 'ol/Observable';

const mousePositionControl = new MousePosition({
    coordinateFormat: createStringXY(4),
    projection: 'EPSG:4326',
    undefinedHTML: 'außerhalb',
});

const DOTS_PER_INCH = 96;
export { DOTS_PER_INCH };

export default class PrintingMap {
    constructor() {
        this.map = new Map({
            controls: defaultControls({ attributionOptions: { collapsible: true } }).extend([mousePositionControl]),
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
                center: transform([12.2958, 50.6231], "EPSG:4326", "EPSG:3857"),
                projection: get("EPSG:3857"),
                //resolution: 100   
                zoom: 13,
            })
        });
        // console.log("map res " + this.map.getView().getResolution());

        var layerSwitcher = new LayerSwitcher({
            tipLabel: 'Legende' // Optional label for button
        });
        this.map.addControl(layerSwitcher);

        var popup = new Popup();
        this.map.addOverlay(popup);

        this.map.on('singleclick', function (evt) {
            //alert("Test");
            var prettyCoord = toStringHDMS(transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326'), 2);
            popup.show(evt.coordinate, '<div><h2>Coordinates</h2><p>' + prettyCoord + '</p></div>');
        });

        this.showPrintBox = false;
    }

    get extentsPrint() {
        return  this.ext;
      }

    getResolutionFromScale(scale, dpi) {
        var units = this.map.getView().getProjection().getUnits();
        var mpu = METERS_PER_UNIT[units];
        var resolution = scale / (mpu * 39.37 * dpi);
        return resolution;
    }

    mapScale(dpi, res) {
        var unit = this.map.getView().getProjection().getUnits();
        var resolution = res;
        var inchesPerMetre = 39.37;

        return resolution * METERS_PER_UNIT[unit] * inchesPerMetre * dpi;
    }

    onMoveEnd(evt) {
        // console.log("MoveEnd");
        this.printSource.clear();       

        let newView = new View({
            center: this.map.getView().getCenter(),
            projection: get("EPSG:3857"),
            resolution: this.res
        });

        // console.log("Kontrolle Scale View " + this.mapScale(DOTS_PER_INCH, this.res));       
        this.ext = newView.calculateExtent([this.width, this.height]);
        console.log("Center " + this.map.getView().getCenter())
        console.log("width: " + this.width + " height: " + this.height);
        console.log(this.ext);
        //var ext = this.map.getView().calculateExtent(this.map.getSize());
        const feature = new Feature({
            'geometry': fromExtent(this.ext)
        });
        this.printSource.addFeature(feature);
    }

    addPrintLayer(scale, width, height, dpi) {
        if (this.showPrintBox === true) {
            return;
        }

        this.scale = scale;
        this.width = width;
        this.height = height;

        this.printSource = new VectorSource({
            wrapX: false,
            features: [],
        });

        this.printLayer = new VectorLayer({
            source: this.printSource,
            style: new Style({
                stroke: new Stroke({
                    color: 'rgba(255, 0, 0, 1.0)',
                    width: 2
                })
            })
        });
        this.map.addLayer(this.printLayer);

        this.res = this.getResolutionFromScale(this.scale, dpi);
        this.movendEvent = this.map.on('moveend', (evt) => {
            this.onMoveEnd(evt);
        });

        this.showPrintBox = true;
        this.onMoveEnd();
        // this.map.renderSync();
    }

    removePrintLayer() {
        if (this.showPrintBox === true) { 
            unByKey(this.movendEvent);  
            this.map.removeLayer(this.printLayer);   
            this.printSource = null;
            this.printLayer = null; 
            this.ext = null;         
        }           
        this.showPrintBox = false;
    }
}
