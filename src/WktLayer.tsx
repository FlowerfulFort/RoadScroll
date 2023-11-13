import L from 'leaflet';
import { useMap, GeoJSON } from 'react-leaflet';

const Wkt = require('wicket');
type WktLayerType = {
    // mapRef: React.RefObject<L.Map>;
    wkt: string[];
};
type GeoFeature = {
    type: string;
    properties: {};
    geometry: Geometry;
};
type Geometry = {
    type: string;
    coordinate: [];
};
const generateFeature = (geometry: Geometry): GeoFeature => {
    return {
        type: 'Feature',
        properties: {},
        geometry: geometry,
    };
};
const WktLayer = ({ wkt }: WktLayerType) => {
    // const wktObj = new Wkt.Wkt();
    const geojson = {
        type: 'FeatureCollection',
        features: new Array(),
    };
    wkt.forEach((w) => {
        const wktObj = new Wkt.Wkt();
        wktObj.read(w);
        geojson.features.push(wktObj.toJson());
    });
    // wktObj.read(wkt);
    return <GeoJSON data={geojson as any} style={{ weight: 7 }} />;
    // L.geoJson(newGeo as any).addTo(map);
    // return null;
};
export default WktLayer;
