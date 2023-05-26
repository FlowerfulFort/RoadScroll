import { useEffect } from 'react';
import parseGeoRaster from 'georaster';
import GeoRasterLayer from 'georaster-layer-for-leaflet';
import L, { useMap, GeoJSON } from 'react-leaflet';
import TestImage from '../resource/test_image.tif';
import TestPath from '../resource/test_road.geojson';

const GeoImageLayer = () => {
    const map = useMap();
    console.log('layer!');
    useEffect(() => {
        console.log('effectlayer');
        fetch(TestImage)
            .then((response) => response.arrayBuffer())
            .then((arrayBuffer) => {
                parseGeoRaster(arrayBuffer).then((georaster: any) => {
                    console.log('georaster: ', georaster);
                    const layer = new GeoRasterLayer({
                        georaster: georaster,
                        opacity: 1,
                        resolution: 256,
                    });
                    layer.addTo(map);
                    map.fitBounds(layer.getBounds());
                    // map.flyToBounds(layer.getBounds());
                    //setTimeout(() => map.removeLayer(layer), 10000);
                });
            });
    }, []);
    return <GeoJSON data={TestPath} />;
};
export default GeoImageLayer;
