import { useState } from 'react';
import L, { LatLngExpression } from 'leaflet';
import { MapContainer, TileLayer, useMap, Marker, Popup } from 'react-leaflet';
import PopupLayer from './PopupLayer';
import icMarker from 'leaflet/dist/images/marker-icon.png';
import icRetina from 'leaflet/dist/images/marker-icon-2x.png';
import shadowImg from 'leaflet/dist/images/marker-shadow.png';
import 'leaflet/dist/leaflet.css';
import LeafletButton from './LeafletButton';
import './map.css';
import ImageList from './ImageList';
import GeoImageLayer from './GeoImageLayer';
type SatelliteImage = {
    name: string;
    path: string;
};
const pos: LatLngExpression = [51.505, -0.09];
const icon = L.icon({
    iconRetinaUrl: icRetina,
    iconUrl: icMarker,
    shadowUrl: shadowImg,
    iconSize: [24, 41],
    iconAnchor: [12, 41],
});
const EntryPoint = (): JSX.Element => {
    const [flag, setFlag] = useState<boolean>(false);
    const [imageList, setImageList] = useState<SatelliteImage[]>([]);

    return (
        <>
            <MapContainer
                id="map"
                style={{ height: '100%', width: '100%' }}
                center={pos}
                zoom={13}
                scrollWheelZoom={true}
            >
                <TileLayer
                    url="https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
                    maxZoom={20}
                    subdomains={['mt1', 'mt2', 'mt3']}
                />
                <Marker position={pos} icon={icon}>
                    <Popup>
                        A pretty CSS3 popup. <br /> Easily customizable.
                    </Popup>
                </Marker>
                <GeoImageLayer />
                <LeafletButton onClick={() => setFlag(true)} />
            </MapContainer>
            {flag && (
                <PopupLayer>
                    <ImageList title="Select/Upload Image" callback={setFlag}>
                        {'['.concat([pos].toString(), ']')}
                    </ImageList>
                </PopupLayer>
            )}
        </>
    );
};
export default EntryPoint;
