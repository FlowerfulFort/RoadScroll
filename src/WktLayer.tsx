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
const LayerStyle = {
    weight: 4,
};
const WktLayer = ({ wkt }: WktLayerType) => {
    // const wktObj = new Wkt.Wkt();
    const geojson = {
        type: 'FeatureCollection',
        features: new Array(),
    };
    for (let i = 0; i < wkt.length; i++) {
        const wktObj = new Wkt.Wkt();
        wktObj.read(wkt[i]);
        const newFeature = generateFeature(wktObj.toJson());
        geojson.features.push(newFeature);
    }

    // wkt.forEach((w) => {
    //     const wktObj = new Wkt.Wkt();
    //     wktObj.read(w);
    //     const newFeature = generateFeature(wktObj.toJson());
    //     geojson.features.push(newFeature);
    //     // geojson.features.push(wktObj.toJson());
    // });
    // wktObj.read(wkt);

    const new_geo = wkt2Network(wkt);
    console.log(new_geo);
    // const graph = new Graph(geojson);
    const graph = new Graph(new_geo);
    const lookup = new CoordinateLookup(graph);
    // const coords1 = lookup.getClosestNetworkPt(127.3775, 36.4756);
    const coords1 = lookup.getClosestNetworkPt(127.4328, 36.4527);
    const coords2 = lookup.getClosestNetworkPt(127.421, 36.436);
    // const coords2 = lookup.getClosestNetworkPt(127.4218, 36.4933);
    const finder = graph.createFinder({
        parseOutputFns: [buildGeoJsonPath, buildEdgeIdList],
    });

    const result = finder.findPath(coords1, coords2);
    console.log('result: ', result);
    // 길을 찾을 수 없는 경우, result.edgelist.length == 0 이 됨.
    // return <>{elementList}</>;

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
