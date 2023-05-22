import React from 'react';
import ReactDOM from 'react-dom/client';
import L, { LatLngExpression, } from 'leaflet';
import { MapContainer, TileLayer, useMap, Marker, Popup } from 'react-leaflet';
import icMarker from 'leaflet/dist/images/marker-icon.png';
import icRetina from 'leaflet/dist/images/marker-icon-2x.png';
import shadowImg from 'leaflet/dist/images/marker-shadow.png';
import 'leaflet/dist/leaflet.css';

const pos: LatLngExpression = [51.505, -0.09];
const icon = L.icon({
    iconRetinaUrl: icRetina,
    iconUrl: icMarker,
    shadowUrl: shadowImg,
});
const EntryPoint = (): JSX.Element => {
    return (
        <MapContainer style={{height: "100%", width: "100%"}} center={pos} zoom={13} scrollWheelZoom={false}>
            {/* <TileLayer 
                url='https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}'
                maxZoom={20}
                subdomains={['mt1', 'mt2', 'mt3']}
            /> */}
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={pos} icon={icon}>
                <Popup>
                    A pretty CSS3 popup. <br /> Easily customizable.
                </Popup>
            </Marker>
        </MapContainer>
    )
};
const root = document.querySelector('#root');
if (!root) throw new Error('html road failed');
ReactDOM.createRoot(root).render(
    <React.StrictMode>
        <EntryPoint />
    </React.StrictMode>
);
