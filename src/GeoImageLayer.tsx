import { useEffect } from 'react';
import parseGeoRaster from 'georaster';
import GeoRasterLayer from 'georaster-layer-for-leaflet';
import L from 'leaflet';
import { useMap, GeoJSON } from 'react-leaflet';
import TestImage from '../resource/test_image.tif';
import TestPath from '../resource/test_road.geojson';

type GeoImageLayerType = {
    jsonString: string | null;
    tifBuffer: ArrayBuffer | null;
};
const GeoImageLayer = ({ tifBuffer, jsonString }: GeoImageLayerType) => {
    const map = useMap();
    let roadData = null;
    console.log('layer!');
    if (jsonString != null) roadData = JSON.parse(jsonString);
    useEffect(() => {
        console.log('effectlayer');

        // fetch(TestImage)
        //     .then((response) => response.arrayBuffer())
        //     .then((arrayBuffer) => {
        //         parseGeoRaster(arrayBuffer).then((georaster: any) => {
        //             console.log('georaster: ', georaster);
        //             const layer = new GeoRasterLayer({
        //                 georaster: georaster,
        //                 opacity: 1,
        //                 resolution: 256,
        //             });
        //             layer.addTo(map);
        //             map.fitBounds(layer.getBounds());
        //             // map.flyToBounds(layer.getBounds());
        //             //setTimeout(() => map.removeLayer(layer), 10000);
        //         });
        //     });
        console.log(tifBuffer == null);
        if (tifBuffer == null) return;
        parseGeoRaster(tifBuffer).then((georaster: any) => {
            console.log('georaster: ', georaster);
            const layer = new GeoRasterLayer({
                georaster: georaster,
                opacity: 1,
                resolution: 256,
            });
            layer.addTo(map);
            map.flyToBounds(layer.getBounds());
        });
    }, []);
    return <GeoJSON data={roadData} style={{ weight: 7 }} />;
};
export default GeoImageLayer;
