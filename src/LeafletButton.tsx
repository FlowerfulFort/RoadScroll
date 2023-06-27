import React, { useEffect } from 'react';
import L, { useMap } from 'react-leaflet';
import { Control, DomUtil, ControlPosition } from 'leaflet';
// import styled from 'styled-components';

// const CustomButton = styled.div`
//     background-color: white;
//     padding: 2px;
//     margin: 2px;
//     text-align: center;
//     &:hover {
//         background-color: skyblue;
//     }
// `;
type LeafletButtonType = {
    title: string;
    style?: Partial<CSSStyleDeclaration> | null;
    onClick: (this: HTMLElement, ev: MouseEvent) => any;
    position?: ControlPosition;
};
const LeafletButton = ({ title, style, onClick, position }: LeafletButtonType): null => {
    const map = useMap();
    useEffect(() => {
        const button = Control.extend({
            onAdd: () => {
                const div = DomUtil.create('div');
                // const div = document.createElement('div');
                div.innerHTML = title;
                if (style != null) {
                    Object.assign(div.style, style);
                }
                div.className = 'buttonLayer';
                div.addEventListener('click', onClick);
                return div;
            },
        });
        const buttonControl = new button({ position: position });
        buttonControl.addTo(map);
    }, []);

    return null;
};
LeafletButton.defaultProps = {
    style: null,
};
export default LeafletButton;
