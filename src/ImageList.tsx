import React, { useState, useMemo, CSSProperties } from 'react';
import styled from 'styled-components';
import CloseImage from '../resource/close.png';

type ImageListType = {
    title: string;
    callback: React.Dispatch<React.SetStateAction<boolean>>;
    children: React.ReactNode;
    // children: string | JSX.Element | JSX.Element[];
    ContentStyle: Partial<CSSProperties>;
};
const TitleBar = styled.div`
    display: flex;
    padding: 4px;
`;
const Title = styled.div`
    display: flex;
    font-size: 24px;
    font-weight: bold;
    padding-left: 10px;
    flex-grow: 1;
`;
const MainContent = styled.div`
    flex-grow: 1;
    padding: 4px 0;
    margin: 0 10px;
    border-top: 1px gray solid;
`;
const CloseButton = styled.img`
    width: 36px;
    padding: 4px;
    &:hover {
        background-color: lightgray;
    }
`;
const ImageList = ({
    title,
    callback,
    children,
    ContentStyle,
}: ImageListType): JSX.Element => {
    return (
        <div className="popupWindow">
            <TitleBar>
                <Title>
                    <div style={{ margin: 'auto 0' }}>{title}</div>
                </Title>
                <CloseButton
                    src={CloseImage}
                    onClick={() => callback(false)}
                    alt="Close"
                />
            </TitleBar>
            <MainContent style={ContentStyle}>{children}</MainContent>
        </div>
    );
};

export default ImageList;
