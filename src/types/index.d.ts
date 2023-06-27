declare module '*.png';
declare module '*.tif';
declare module 'georaster';
declare module '*.geojson';

type MyGeoLocation = [number, number];
type SatelliteImageData = {
    name: string; // file name
    uri: string; // file uri
    location: MyGeoLocation; // geolocation
    size: number; // file size
};
