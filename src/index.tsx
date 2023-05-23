import React from 'react';
import ReactDOM from 'react-dom/client';
import L, { LatLngExpression } from 'leaflet';
import { MapContainer, TileLayer, useMap, Marker, Popup } from 'react-leaflet';
import icMarker from 'leaflet/dist/images/marker-icon.png';
import icRetina from 'leaflet/dist/images/marker-icon-2x.png';
import shadowImg from 'leaflet/dist/images/marker-shadow.png';
import 'leaflet/dist/leaflet.css';
import LeafletButton from './LeafletButton';
import './map.css';
const pos: LatLngExpression = [51.505, -0.09];
const icon = L.icon({
    iconRetinaUrl: icRetina,
    iconUrl: icMarker,
    shadowUrl: shadowImg,
    iconSize: [24, 41],
    iconAnchor: [12, 41],
});
const EntryPoint = (): JSX.Element => {
    return (
        <>
            <MapContainer
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
                <LeafletButton onClick={() => console.log('button clicked')} />
            </MapContainer>
        </>
    );
};
const root = document.querySelector('#root');
if (!root) throw new Error('html road failed');
ReactDOM.createRoot(root).render(
    // 무슨 이유인지는 모르겠지만 React 18에서 StrictMode로 렌더하면
    // 렌더 후 해제하고 다시 렌더함. 그래서 Control을 map에 추가하는 것이 두번 이루어짐.
    <EntryPoint />
);
