import L from 'leaflet';
import styled from 'styled-components';

const Cell = styled.div`
    font-size: 14px;
    display: flex;
    margin: inherit;
    padding: 4px 6px;
    border-bottom: 1px gray solid;
`;

type ImageInfoCellProp = {
    name: string;
    local_path: string;
    location: number[] | L.LatLngExpression;
};

const ImageInfoCell = ({ name, local_path, location }: ImageInfoCellProp) => {
    return (
        <Cell>
            <a style={{ flexGrow: '4' }} href="#">
                {name}
            </a>
            <div style={{ flexGrow: '1' }}>{'['.concat(location.toString(), ']')}</div>
        </Cell>
    );
};
export default ImageInfoCell;
