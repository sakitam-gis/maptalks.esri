import * as maptalks from 'maptalks';
const { extend, Browser } = maptalks.Util;
const TileLayer = maptalks.TileLayer;

/**
 * TileArcGISRest
 * @instance
 */
const options = {
    crs: null,
    uppercase: false,
    detectRetina : false
};

const getParamString = (obj, existingUrl, uppercase) => {
    const params = [];
    for (const i in obj) {
        params.push(encodeURIComponent(uppercase ? i.toUpperCase() : i) + '=' + encodeURIComponent(obj[i]));
    }
    return ((!existingUrl || existingUrl.indexOf('?') === -1) ? '?' : '&') + params.join('&');
};

const defaultParams = {
    format: 'png32',
    layers: '',
    layerDefs: '',
    timeOptions: '',
    transparent: true,
    dpi: 90,
    size: '256,256',
    bboxsr: '4326',
    f: 'image'
};

class TileArcGISRest extends TileLayer {
    constructor(id, options) {
        super(id);
        const params = extend({}, defaultParams);
        for (const p in options) {
            if (!(p in this.options)) {
                params[p] = options[p];
            }
        }
        this.setOptions(options);
        const r = options.detectRetina && Browser.retina ? 2 : 1,
            tileSize = this.getTileSize();
        params.size = `${tileSize.width * r},${tileSize.height * r}`;
        this._params = params;
    }

    onAdd() {
        this._params['bboxsr'] = this.options.bboxsr || this.getMap().getProjection().code;
        super.onAdd();
    }

    getTileUrl(x, y, z) {
        const map = this.getMap(),
            res = map._getResolution(z),
            tileConfig = this._getTileConfig(),
            tileExtent = tileConfig.getTilePrjExtent(x, y, res);
        const max = tileExtent.getMax(),
            min = tileExtent.getMin();

        const bbox = [min.x, min.y, max.x, max.y].join(',');
        const url = super.getTileUrl(x, y, z);
        return url +
            getParamString(this._params, url, this.options.uppercase) +
            (this.options.uppercase ? '&BBOX=' : '&bbox=') + bbox;
    }

    /**
     * Export the WMSTileLayer's json. <br>
     * It can be used to reproduce the instance by [fromJSON]{@link Layer#fromJSON} method
     * @return {Object} layer's JSON
     */
    toJSON() {
        return {
            'type': 'TileArcGISRest',
            'id': this.getId(),
            'options': this.config()
        };
    }

    /**
     * Reproduce a TileArcGISRest from layer's JSON.
     * @param  {Object} layerJSON - layer's JSON
     * @return {TileArcGISRest}
     * @static
     * @private
     * @function
     */
    static fromJSON(layerJSON) {
        if (!layerJSON || layerJSON['type'] !== 'TileArcGISRest') {
            return null;
        }
        return new TileArcGISRest(layerJSON['id'], layerJSON['options']);
    }
}

TileArcGISRest.registerJSONType('TileArcGISRest');

TileArcGISRest.mergeOptions(options);

export default TileArcGISRest;
