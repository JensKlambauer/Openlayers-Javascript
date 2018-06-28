import TileLayer from 'ol/layer/Tile';
import TileWMS from 'ol/source/TileWMS';

export default class SachsenWmsDopLayer extends TileLayer {

    constructor() {
        const src = new TileWMS({
            url: "https://geodienste.sachsen.de/wms_geosn_dop-rgb/guest",
            params: {
                LAYERS: "sn_dop_020",
                SRID: "3857"              
            }                    
        });

        super({ source: src, visible: false });
        this.set("title", "SachenDop");
        this.set("type", "base");
    }
}