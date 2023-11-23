import { useMap, GeoJSON } from 'react-leaflet';
import { useMemo, useEffect, useRef } from 'react';

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
export type Geometry = {
    type: string;
    coordinates: Array<[number, number]>;
};
export const generateFeature = (geometry: Geometry): GeoFeature => {
    return {
        type: 'Feature',
        properties: {},
        geometry: geometry,
    };
};
const LayerStyle = {
    weight: 2,
    color: 'white',
};
const WktLayer = ({ wkt }: WktLayerType) => {
    // const wktObj = new Wkt.Wkt();
    const count = useRef<number>(0);
    const geojson = useMemo(() => {
        const g = {
            type: 'FeatureCollection',
            features: new Array(),
        };
        for (let i = 0; i < wkt.length; i++) {
            const wktObj = new Wkt.Wkt();
            wktObj.read(wkt[i]);
            const newFeature = generateFeature(wktObj.toJson());
            g.features.push(newFeature);
        }
        count.current++;
        return g;
    }, [wkt]);

    return <GeoJSON data={geojson as any} style={LayerStyle} key={count.current} />;

    // L.geoJson(newGeo as any).addTo(map);
    // return null;
};
export default WktLayer;
