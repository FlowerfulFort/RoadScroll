import { LeafletEventHandlerFnMap } from 'leaflet';
import { useMapEvents, useMap } from 'react-leaflet';

const MapEvents = () => {
    const map = useMap();
    const mapEvent = useMapEvents({
        click(e) {
            console.log(e.latlng, e.containerPoint);
        },
        contextmenu(e) {
            console.log(e.latlng, e.containerPoint);
        },
    });
    return null;
};

export default MapEvents;
