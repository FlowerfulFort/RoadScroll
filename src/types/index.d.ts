declare module '*.png';
declare module '*.tif';
declare module 'georaster';
declare module '*.geojson';

type MyGeoLocation = [number, number];
type ImageStatus =
    | 'Initializing'
    | 'Generating XYZ'
    | 'Detecting Roads'
    | 'Idle'
    | 'Error';
type SatelliteImageData = {
    name: string; // file name
    uri: string; // file uri
    location: MyGeoLocation; // geolocation
    size: number; // file size
};
type GeoEXIF = {
    location: MyGeoLocation;
    width: number;
    height: number;
};
type ObjType = {
    // string literal 문제를 해결해기 위한 object type.
    [k: string]: any;
};
type ImageBounds = {
    left: number;
    right: number;
    top: number;
    bottom: number;
};
type SateImageInfo = {
    title: string;
    size: number;
    sha256: string;
    location: MyGeoLocation;
    resolution: [number, number];
    bounds: ImageBounds;
    state: ImageStatus;
};
