import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import L, { LatLngExpression } from 'leaflet';
import sc from './sc_ImageTable';
const DefaultMessage = () => {
    return <sc.DefaultMsg>There's no data here yet.</sc.DefaultMsg>;
};
// type SatelliteImageData = {
//     name: string; // file name
//     uri: string; // file uri
//     location: MyGeoLocation; // geolocation
//     size: number; // file size
// };
type ImageTableType = {
    // data: Array<SatelliteImageData>;
    data: Array<SateImageInfo>;
    select_callback: (index: number) => any;
    mapRef: React.RefObject<L.Map>;
    // promise_callback?: () => Promise<AxiosResponse>;
};
type RowInfo = {
    d: SateImageInfo;
    onClickListener: React.MouseEventHandler<HTMLAnchorElement>;
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

// const TableRow = (title: string): JSX.Element => {
//     return;
// };
// const Data2Row = (d: SatelliteImageData): JSX.Element => {
const Data2Row = (
    d: SateImageInfo,
    onClickListener: React.MouseEventHandler<HTMLAnchorElement>
): JSX.Element => {
    return (
        <>
            <td>
                {/* <a href={d.uri}>{d.name}</a> */}
                {/* <a href={`/api/image/${d.sha256}.tif`}>{d.title}</a> */}
                <a href="#" onClick={onClickListener}>
                    {d.title}
                </a>
            </td>
            <td>{d.size}</td>
            <td>{`[${d.location[0]}, ${d.location[1]}]`}</td>
        </>
    );
};
const ImageTable = ({ data, select_callback, mapRef }: ImageTableType) => {
    // const [fetched, setfetched] = useState<number>(0);
    // let body: JSX.Element = DefaultMessage();
    // if (promise_callback != undefined) {
    //     useEffect(() => {}, []);
    //     promise_callback().then((response) => {
    //         const fetched_data = response.data;

    //         setfetched(fetched + 1);
    //     }).catch(reason => {
    //         console.log(reason);
    //     });
    // }

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
                    {data.map((e, i) => (
                        <tr key={i}>
                            {Data2Row(e, (event) => {
                                console.log(`call: ${i}`);
                                select_callback(i);
                                mapRef.current?.flyTo(e.location);
                            })}
                        </tr>
                    ))}
                </tbody>
            </CustomTable>
        </>
    );
};
export default ImageTable;
