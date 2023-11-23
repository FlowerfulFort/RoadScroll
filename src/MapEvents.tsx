import { LeafletEventHandlerFnMap } from 'leaflet';
import { useMapEvents, useMap } from 'react-leaflet';
import { useRef } from 'react';
type MapEventsType = {
    callbacks: Array<React.Dispatch<React.SetStateAction<[number, number]>>>;
};

export const CrossClickMapEvents = ({ callbacks }: MapEventsType) => {
    const counter = useRef<number>(0);
    const mapEvent = useMapEvents({
        click(e) {
            console.log(e.latlng, e.containerPoint);
        },
        contextmenu(e) {
            console.log(e.latlng, e.containerPoint);
            const lat = e.latlng.lat;
            const lng = e.latlng.lng;
            callbacks[counter.current % callbacks.length]([lng, lat]);
            counter.current++;
        },
    });
    return null;
};
