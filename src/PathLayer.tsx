import { GeoJSON } from 'react-leaflet';
import { useMemo, useEffect } from 'react';
import { wkt2Network } from './utils';
import { PathOptions } from 'leaflet';
const {
    Graph,
    CoordinateLookup,
    buildGeoJsonPath,
    buildEdgeIdList,
} = require('geojson-dijkstra');
type PathLayerType = {
    wkt: string[];
    // lng, lat
    pos1: [number, number];
    pos2: [number, number];
    style?: PathOptions;
};
const defaultStyle: PathOptions = {
    color: 'red',
    weight: 2,
};
const PathLayer = ({ wkt, pos1, pos2, style }: PathLayerType): JSX.Element => {
    const road = useMemo(() => {
        const network = wkt2Network(wkt);
        const graph = new Graph(network);
        return {
            graph: graph,
            lookup: new CoordinateLookup(graph),
            finder: graph.createFinder({
                parseOutputFns: [buildGeoJsonPath, buildEdgeIdList],
            }),
        };
    }, [wkt]);

    const coords1 = road.lookup.getClosestNetworkPt(pos1[0], pos1[1]);
    const coords2 = road.lookup.getClosestNetworkPt(pos2[0], pos2[1]);
    // const finder = road.graph.createFinder({
    //     parseOutputFns: [buildGeoJsonPath, buildEdgeIdList],
    // });
    if (typeof style == 'undefined' || style == null) style = defaultStyle;
    const result = road.finder.findPath(coords1, coords2);
    return <GeoJSON data={result.geojsonPath} style={style} key={pos2[1] + pos2[0]} />;
};
export default PathLayer;
