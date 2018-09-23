import Map from 'ol/Map.js';
import View from 'ol/View.js';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
//import XYZ from 'ol/source/xyz';
// import Proj from 'ol/proj';
import { addProjection, addCoordinateTransforms, transform, get, METERS_PER_UNIT } from 'ol/proj.js';
import Group from 'ol/layer/Group';
import LayerSwitcher from 'ol-layerswitcher';
// import Popup from 'ol-popup';
// import Coordinate from 'ol/coordinate';
// import { toStringHDMS } from 'ol/coordinate';
import SachsenDop from './SachsenWmsDopLayer';
import VectorLayer from 'ol/layer/Vector.js';
import VectorSource from 'ol/source/Vector.js';
// import Polygon from 'ol/geom/Polygon';
// import * as ol from 'ol';
import { fromExtent } from 'ol/geom/Polygon.js';
import { Circle as CircleStyle, Fill, Stroke, Style, Text } from 'ol/style.js';
import Feature from 'ol/Feature.js';
import { defaults as defaultControls } from 'ol/control.js';
import MousePosition from 'ol/control/MousePosition.js';
import { createStringXY } from 'ol/coordinate.js';
import { unByKey } from 'ol/Observable';
import Select from 'ol/interaction/Select'
import { click, pointerMove, altKeyOnly } from 'ol/events/condition.js';
import WKT from 'ol/format/WKT.js';
import BingMaps from 'ol/source/BingMaps.js';
import { MouseWheelZoom, DragPan } from 'ol/interaction.js';
import Collection from 'ol/Collection';
import { bbox as bboxStrategy } from 'ol/loadingstrategy.js';

const mousePositionControl = new MousePosition({
    coordinateFormat: createStringXY(4),
    projection: 'EPSG:4326',
    undefinedHTML: 'außerhalb',
});

const DOTS_PER_INCH = 96;
export { DOTS_PER_INCH };

export default class PrintingMap {
    constructor(wktCoordnate, zoom, idProj) {
        this.idProj = idProj;
        var center = transform([12.2958, 50.6231], "EPSG:4326", "EPSG:3857");
        if (wktCoordnate) {
            let format = new WKT();
            center = format.readGeometry(wktCoordnate, {
                dataProjection: 'EPSG:4326',
                featureProjection: 'EPSG:3857'
            }).getCoordinates();
        }

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
                    }),
                    new SachsenDop(),
                    new TileLayer({
                        title: 'Bing',
                        type: 'base',
                        source: new BingMaps({
                            imagerySet: 'Aerial',
                            key: process.env.BING_KEY
                        }),
                        visible: false,
                    })]
            })],
            view: new View({
                center: center,
                projection: get("EPSG:3857"),
                maxZoom: 19,
                //resolution: 100   
                zoom: zoom ? zoom : 12,
            })
        });
        // console.log("map res " + this.map.getView().getResolution());

        var layerSwitcher = new LayerSwitcher({
            tipLabel: 'Legende' // Optional label for button
        });
        this.map.addControl(layerSwitcher);

        // Popup 
        // var popup = new Popup();
        // this.map.addOverlay(popup);

        // this.map.on('singleclick', function (evt) {
        //     //alert("Test");
        //     var prettyCoord = toStringHDMS(transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326'), 2);
        //     popup.show(evt.coordinate, '<div><h2>Coordinates</h2><p>' + prettyCoord + '</p></div>');
        // });

        this.showPrintBox = false;
        this.interaktionen = true;
        this.showUserFeatures = false;
    }

    get extentsPrint() {
        return this.ext;
    }

    set printExtents(ext) {
        this.ext = ext;
    }

    get selectedPrintFeatures() {
        const selFeats = this.select.getFeatures();
        const extents = [];
        selFeats.forEach((feature) => {
            extents.push(feature.getGeometry().getExtent());
        });

        return extents;
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
        this.select.getFeatures().clear();
        this.printSource.clear();
        let center = this.map.getView().getCenter();
        let ext = this.getExtPrintView(center);
        // this.addFeaturePrint(ext);
        // console.log("Center " + this.map.getView().getCenter())
        // console.log("width: " + this.width + " height: " + this.height);
        // console.log(this.map.getSize());
        let bounds = this.map.getView().calculateExtent(this.map.getSize());

        this.featureCount = 0;
        let breite = center[0];
        let rightBound = center[0];
        let hoehe = center[1];
        while (hoehe < bounds[3]) {
            while (rightBound < bounds[2]) {
                const extb = this.getExtPrintView([breite, hoehe])
                this.addFeaturePrint(extb);
                rightBound = breite + ((ext[2] - ext[0]) / 2);
                breite = breite + (ext[2] - ext[0]);
            }
            hoehe = hoehe + (ext[3] - ext[1]);
            breite = center[0];
            rightBound = center[0];
        }

        breite = center[0];
        hoehe = center[1];
        while (hoehe < bounds[3]) {
            while (breite > bounds[0]) {
                const ext1 = this.getExtPrintView([breite - (ext[2] - ext[0]), hoehe])
                this.addFeaturePrint(ext1);
                breite = breite - (ext[2] - ext[0]);
            }
            hoehe = hoehe + (ext[3] - ext[1]);
            breite = center[0];
        }

        breite = center[0];
        hoehe = center[1];
        rightBound = center[0];
        while (hoehe > bounds[1]) {
            while (rightBound < bounds[2]) {
                const extb = this.getExtPrintView([breite, hoehe - (ext[3] - ext[1])])
                this.addFeaturePrint(extb);
                rightBound = breite + ((ext[2] - ext[0]) / 2);
                breite = breite + (ext[2] - ext[0]);
            }
            hoehe = hoehe - (ext[3] - ext[1]);
            breite = center[0];
            rightBound = center[0];
        }

        breite = center[0];
        hoehe = center[1];
        while (hoehe > bounds[1]) {
            while (breite > bounds[0]) {
                const ext1 = this.getExtPrintView([breite - (ext[2] - ext[0]), hoehe - (ext[3] - ext[1])])
                this.addFeaturePrint(ext1);
                breite = breite - (ext[2] - ext[0]);
            }
            hoehe = hoehe - (ext[3] - ext[1]);
            breite = center[0];
        }
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
            style: function (feature) {
                let featId = feature.getId();
                let style = new Style({
                    stroke: new Stroke({
                        color: 'rgba(255, 0, 0, 1.0)',
                        width: 2
                    }),
                    fill: new Fill({
                        color: 'rgba(255, 0, 0, 0.1)'
                    }),
                    text: new Text({
                        text: featId.toString(),
                        font: "Bold " + 14 + 'px sans-serif',
                        stroke: new Stroke({ color: "#fff", width: 5 }),
                        fill: new Fill({
                            color: '#000'
                        })
                    })
                });
                return style;
            }
        });
        this.map.addLayer(this.printLayer);

        this.res = this.getResolutionFromScale(this.scale, dpi);
        this.movendEvent = this.map.on('moveend', (evt) => {
            this.onMoveEnd(evt);
        });

        this.showPrintBox = true;
        this.select = new Select({
            condition: click,
            //layers: function (layer) {
            //    return /* some logic on layer to decide if its features should be considered; return true if yes */;
            //},
            // filter: function(feature, layer) {
            //     /* some logic on a feature and layer to decide if it should be selectable; return true if yes */
            //     return layer === this.printLayer;
            // }
        });

        this.map.addInteraction(this.select);
        // https://openlayers.org/en/latest/examples/hit-tolerance.html
        // this.featureClick = this.map.on('singleclick', (e) => {
        //     let hit = false;
        //     let featureHit = null;
        //     this.map.forEachFeatureAtPixel(e.pixel, function (feature, layer) {
        //         hit = true;
        //         featureHit = feature;
        //         // console.log(feature);
        //     });
        //     if (hit) {
        //         this.printExtents = featureHit.getGeometry().getExtent();
        //     }
        // });
        this.onMoveEnd();
    }

    removePrintLayer() {
        if (this.showPrintBox === true) {
            unByKey(this.movendEvent);
            this.map.removeLayer(this.printLayer);
            this.printSource = null;
            this.printLayer = null;
            this.ext = null;
            this.map.removeInteraction(this.select);
            unByKey(this.featureClick);
        }
        this.showPrintBox = false;
    }

    getExtPrintView(center) {
        let newView = new View({
            center: center,
            projection: get("EPSG:3857"),
            resolution: this.res
        });

        // console.log("Kontrolle Scale View " + this.mapScale(DOTS_PER_INCH, this.res));       
        return newView.calculateExtent([this.width, this.height]);
    }

    addFeaturePrint(extents) {
        const feature = new Feature({
            'geometry': fromExtent(extents)
        });
        feature.setId(this.featureCount);
        this.featureCount++;
        // console.log(this.featureCount);
        this.printSource.addFeature(feature);
    }

    disableIntact(e) {
        const interactions = this.interaktionen;
        this.map.getInteractions().forEach(function (interaction) {
            if (interaction instanceof MouseWheelZoom) {
                //console.log("MouseWheelZoom");
                interaction.setActive(!interactions);
            }

            if (interaction instanceof DragPan) {
                //console.log("DragPan");
                interaction.setActive(!interactions);
            }

            //map.removeInteraction(interaction);
        }, this);
        this.interaktionen = !this.interaktionen;
    }
    
    addFeaturesUser(printService) {
        if (this.showUserFeatures === true) {
            return;
        }

        // console.log(this.idProj)
        const idProj = this.idProj;
        const features = new Collection();
        const vectorSource = new VectorSource({
            features: features,
            loader: function (extent, resolution, projection) {
                let res = null;
                let json = JSON.stringify({ idProj: idProj });
                // URL GetFeature aus Config .env
                // const url = process.env.KF_RB_URL;
                (async function () {
                    res = await printService.getFeatures(idProj);
                    // res = await PostRequest(url, json);
                })()
                    .then(() => {
                        // console.log(res);                       
                        const resJson = JSON.parse(res);
                        // console.log(resJson.error);
                        if (resJson.error === 0) {
                            const format = new WKT();
                            resJson.data.features.forEach(function (feat) {
                                var feature = format.readFeature(feat.Wkt, {
                                    dataProjection: 'EPSG:4326',
                                    featureProjection: 'EPSG:3857'
                                });
                                if (feature) {
                                    feature.setId(feat.FeatId);
                                    vectorSource.addFeature(feature);
                                }
                            });
                        }
                    })
                    .catch(e => { console.error(e); });
            },
            strategy: bboxStrategy
        });

        const vector = new VectorLayer({
            source: vectorSource,
            style: new Style({
                fill: new Fill({
                    color: 'rgba(255, 0, 0, 0.1)'
                }),
                stroke: new Stroke({
                    color: '#ff0000',
                    width: 2
                }),
                image: new CircleStyle({
                    radius: 5,
                    fill: new Fill({
                        color: '#ff0000'
                    })
                })
            })
        });

        this.map.addLayer(vector);
        this.showUserFeatures = true;
    }
}
