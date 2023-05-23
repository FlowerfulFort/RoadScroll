import styled from 'styled-components';

const PopupLayer = styled.div`
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    background-color: rgba(255, 255, 255, 0.5);
    z-index: 255;
    display: flex;
`;

export default PopupLayer;