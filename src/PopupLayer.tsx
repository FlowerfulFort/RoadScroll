import styled from 'styled-components';

const PopupLayer = styled.div`
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 255;
    padding: 4px;
    display: flex;
`;

export default PopupLayer;

// const PopupLayer = () => {
//     const map = useMap();
//     useEffect(() => {
//         const layer = Marker.extend({
//             onAdd:
//         })
//     })
// }
