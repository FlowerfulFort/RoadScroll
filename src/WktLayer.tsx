import L from 'leaflet';
import { useMap, GeoJSON } from 'react-leaflet';
import { wkt2Network } from './utils';
const {
    Graph,
    CoordinateLookup,
    buildGeoJsonPath,
    buildEdgeIdList,
} = require('geojson-dijkstra');

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
const WktLayer = ({ wkt }: WktLayerType) => {
    // const wktObj = new Wkt.Wkt();
    const geojson = {
        type: 'FeatureCollection',
        features: new Array(),
    };
    wkt.forEach((w) => {
        const wktObj = new Wkt.Wkt();
        wktObj.read(w);
        const newFeature = generateFeature(wktObj.toJson());
        geojson.features.push(newFeature);
        // geojson.features.push(wktObj.toJson());
    });
    // wktObj.read(wkt);
    const new_geo = wkt2Network(wkt);
    console.log(new_geo);
    // const graph = new Graph(geojson);
    const graph = new Graph(new_geo);
    const lookup = new CoordinateLookup(graph);
    const coords1 = lookup.getClosestNetworkPt(127.3775, 36.4756);
    // const coords1 = lookup.getClosestNetworkPt(127.3549, 36.4881);
    // const coords2 = lookup.getClosestNetworkPt(127.4106, 36.5052);
    const coords2 = lookup.getClosestNetworkPt(127.4218, 36.4933);
    const finder = graph.createFinder({
        parseOutputFns: [buildGeoJsonPath, buildEdgeIdList],
    });

    const result = finder.findPath(coords1, coords2);
    console.log('result: ', result);
    return (
        <>
            <GeoJSON data={geojson as any} style={{ weight: 4 }} />
            <GeoJSON data={result.geojsonPath} style={{ color: 'red', weight: 2 }} />
        </>
    );

    // L.geoJson(newGeo as any).addTo(map);
    // return null;
};
export default WktLayer;
