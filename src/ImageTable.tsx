import React from 'react';
import styled from 'styled-components';

// type SatelliteImageData = {
//     name: string; // file name
//     uri: string; // file uri
//     location: MyGeoLocation; // geolocation
//     size: number; // file size
// };
type ImageTableType = {
    data: Array<SatelliteImageData>;
};
export const CustomTable = styled.table`
    border-collapse: collapse;
    font-size: 16px;
    text-align: left;
    width: calc(100% - 20px);
    margin: 0 10px;
    th {
        border-right: 1px solid black;
        padding-left: 16px;
        padding-bottom: 7px;
        padding-top: 3px;
        &:nth-last-child(1) {
            border-right: 0;
        }
    }
    tr {
        &:not(.tableHeader):nth-child(even) {
            background-color: rgb(240, 240, 240);
        }
        border-bottom: 1px solid black;
        &:not(.tableHeader):last-child {
            border-bottom: 0;
        }
        td {
            padding-top: 3px;
            padding-bottom: 7px;
            padding-left: 16px;
            border-right: 1px solid black;
            &:nth-last-child(1) {
                border-right: 0;
            }
        }
        &:not(.tableHeader):hover {
            background-color: rgb(240, 240, 240);
        }
    }
    a {
        text-decoration-line: none;
        &:hover {
            color: grey;
            text-decoration-line: underline;
        }
    }
`;
const _th = styled.th`
    border-right: 2px solid black;
    &:nth-last-child(1) {
        border-right: 0 solid white;
    }
    &:hover {
        color: blue;
    }
`;
const Data2Row = (d: SatelliteImageData): JSX.Element => {
    return (
        <>
            <td>
                <a href={d.uri}>{d.name}</a>
            </td>
            <td>{d.size}</td>
            <td>{`[${d.location[0]}, ${d.location[1]}]`}</td>
        </>
    );
};
const ImageTable = ({ data }: ImageTableType) => {
    let k = 0;
    return (
        <>
            <CustomTable>
                <thead>
                    <tr className="tableHeader">
                        <th style={{ width: '50%' }}>Name</th>
                        <th>Size</th>
                        <th>Location</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((e) => (
                        <tr key={k++}>{Data2Row(e)}</tr>
                    ))}
                </tbody>
            </CustomTable>
        </>
    );
};
export default ImageTable;
