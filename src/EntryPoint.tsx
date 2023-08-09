import { useState, useEffect, useRef, useCallback } from 'react';
import L, { LatLngExpression } from 'leaflet';
import { MapContainer, TileLayer, useMap, Marker, Popup } from 'react-leaflet';
import PopupLayer from './PopupLayer';
import icMarker from 'leaflet/dist/images/marker-icon.png';
import icRetina from 'leaflet/dist/images/marker-icon-2x.png';
import shadowImg from 'leaflet/dist/images/marker-shadow.png';
import 'leaflet/dist/leaflet.css';
import LeafletButton from './LeafletButton';
import './map.css';
import ImageList from './ImageList';
import GeoImageLayer from './GeoImageLayer';
import ImageTable from './ImageTable';
import sc from './sc_EntryPoint';
import DetailedInfo from './DetailedInfo';
import MapEvents from './MapEvents';
import { getInfoFromDB, return_API_URL, get_XYZ_URL } from './utils';
import axios from 'axios';
// type SatelliteImage = {
//     name: string;
//     path: string;
// };
/*
해야할 것
Upload 버튼 구현
    Upload 하기 전, 미리 sha256 해시를 진행하고, 미리 받아온 이미지 리스트의 해시값과 비교한다
    만약해시가 존재한다면 동일한 이미지를 다시 업로드 하는 것이므로 alert를 띄운다
*/
const API_UPLOAD = '/api/uploadimage_test';
const example_data: Array<SatelliteImageData> = [
    {
        name: 'a.png',
        uri: '#',
        location: [3.5, 6.1],
        size: 413415253,
    },
    {
        name: 'b.png',
        uri: '#',
        location: [643.2, 13.4523],
        size: 359231578,
    },
    {
        name: 'b.png',
        uri: '#',
        location: [643.2, 13.4523],
        size: 359231578,
    },

    {
        name: 'c.tif',
        uri: '#',
        location: [19.3, 148.32],
        size: 783479834324,
    },
];
const infoName = ['Latitude', 'Longitude', 'Width', 'Height'];
const pos: LatLngExpression = [51.505, -0.09];
const icon = L.icon({
    iconRetinaUrl: icRetina,
    iconUrl: icMarker,
    shadowUrl: shadowImg,
    iconSize: [24, 41],
    iconAnchor: [12, 41],
});
// type ImageFile = ArrayBuffer | string | null;
const EntryPoint = (): JSX.Element => {
    /********** State **********
     * flag: Select Image 버튼 플래그
     * // userImage: 선택한 이미지 파일의 이름, 사실상 사용하는 데가 없어서 폐기예정.
     * imageBuffer: 선택한 이미지를 저장할 버퍼.
     * roadData: geojson으로 저장되어 있는 도로 데이터
     * // imageList: DB에서 불러올 이미지 리스트.
     * // filetext: 파일 선택 예시 함수에서 사용함. 폐기할듯.
     * detailedFlag: 상세설정 버튼 플래그
     ***************************/

    const [flag, setFlag] = useState<boolean>(false);
    const [userImage, setUserImage] = useState<string>('');
    const [imagePointer, setImagePointer] = useState<File | null>(null);
    // const [roadData, setRoadData] = useState<string | null>(null);
    const [imageList, setImageList] = useState<Array<SateImageInfo>>([]);
    // const [filetext, setFileText] = useState<string | null | ArrayBuffer>(null);
    const [detailedFlag, setDetailedFlag] = useState<boolean>(false);

    const [targetImage, setTargetImage] = useState<number | null>(null);

    const detailRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<L.Map>(null);
    // let imageBuffer: ArrayBuffer | null = null;
    // let roadData: string | null = null;

    /* 데모용 이미지 선택 함수 */
    const onImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        console.log('selected');
        if (e.target.files != null) {
            setImagePointer(e.target.files[0]);
        }
        // const fileReader = new FileReader();
        // if (e.target.files == null) return;
        // fileReader.onload = () => {
        //     setImageBuffer(fileReader.result as ArrayBuffer);
        //     setUserImage(e.target.files![0].name);
        // };
        // fileReader.readAsArrayBuffer(e.target.files[0]);
    }, []);
    /* 데모용 도로 선택 함수 */
    // const roadSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     const fileReader = new FileReader();
    //     if (e.target.files == null) return;
    //     fileReader.onload = () => {
    //         setRoadData(fileReader.result as string);
    //         setUserImage(userImage + e.target.files![0].name);
    //     };
    //     fileReader.readAsText(e.target.files[0]);
    // };
    /* 파일 선택 예시 */
    // const fileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     const fileReader = new FileReader();
    //     fileReader.onload = () => {
    //         console.log(fileReader.result);
    //         setFileText(fileReader.result);
    //     };

    //     if (e.target.files != null) {
    //         fileReader.readAsText(e.target.files[0]);
    //     }
    //     // setImageList(Array.from(e.target.files || []));
    // };
    const uploadImage = useCallback(() => {
        if (detailedFlag) {
            const inputs = detailRef.current?.querySelectorAll('tbody input');
            const exif: ObjType = {};
            infoName.forEach((name, index) => {
                exif[name] = (inputs![index] as HTMLInputElement).value;
            });

            console.log(exif);
        }
        if (imagePointer != null) {
            const formData = new FormData();
            formData.append('file', imagePointer);
            console.log('before upload(async) request');
            axios
                .post(`${API_UPLOAD}?ext=tif`, formData, {
                    timeout: 50000, // 5 min
                })
                .then((res) => {
                    console.log(res.data);
                })
                .catch((err) => {
                    if (axios.isCancel(err)) {
                        alert(`Canceled: ${err.message}`);
                    } else {
                        console.error('Error: ', err);
                        alert('Error, refer the console.');
                    }
                });
            console.log('after upload request');
        }
    }, [imagePointer]);

    const updateImageList = useCallback(async () => {
        const data = await getInfoFromDB();
        setImageList(data);
    }, []);
    // for debugging
    useEffect(() => {
        updateImageList().then((data) => console.log('first update: ', data));
    }, []);
    useEffect(() => {
        console.log(imageList);
    }, [imageList]);
    useEffect(() => {
        console.log('targetImage changed: ', targetImage);
    }, [targetImage]);
    return (
        <>
            <MapContainer
                id="map"
                style={{ height: '100%', width: '100%' }}
                center={pos}
                zoom={13}
                scrollWheelZoom={true}
                ref={mapRef}
            >
                <TileLayer
                    url="https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
                    maxZoom={20}
                    subdomains={['mt1', 'mt2', 'mt3']}
                />
                {targetImage && imageList[targetImage] && (
                    <TileLayer
                        url={get_XYZ_URL(imageList[targetImage])}
                        maxZoom={20}
                        opacity={0.5}
                    />
                )}
                <MapEvents />
                <Marker position={pos} icon={icon}>
                    <Popup>
                        A pretty CSS3 popup. <br /> Easily customizable.
                    </Popup>
                </Marker>
                {/* {imageBuffer != null && (
                    <GeoImageLayer tifBuffer={imageBuffer} jsonString={null} />
                )}
                {roadData != null && (
                    <GeoImageLayer tifBuffer={null} jsonString={roadData} />
                )} */}
                {/* {userImage && (
                    <GeoImageLayer tifBuffer={imageBuffer} jsonString={roadData} />
                )} */}
                <LeafletButton
                    title="Select Image"
                    onClick={() => setFlag(true)}
                    position="topright"
                    style={{
                        border: '1px solid white',
                        borderRadius: '25px',
                        boxShadow: '5px 5px 5px',
                        marginRight: '15px',
                        marginTop: '15px',
                    }}
                />
            </MapContainer>

            {/* Select Image 버튼의 팝업 레이어 */}
            {flag && (
                <PopupLayer>
                    <ImageList
                        title="Select/Upload Image"
                        callback={setFlag}
                        ContentStyle={{ display: 'flex', flexDirection: 'column' }}
                    >
                        <div
                            style={{
                                flex: '1 1 0',
                                overflowY: 'auto',
                                marginBottom: 'auto',
                            }}
                        >
                            {/* <ImageTable data={example_data} /> */}
                            <ImageTable
                                data={imageList}
                                select_callback={setTargetImage}
                                mapRef={mapRef}
                            />
                        </div>
                        <sc.HorizontalLine />

                        {detailedFlag && (
                            <DetailedInfo items={infoName} ref={detailRef} />
                        )}
                        <sc.ImageListFooter>
                            <input type="file" onChange={onImageSelect} accept=".tif" />
                            <input type="file" />
                            <div style={{ marginLeft: 'auto' }}>
                                {/* <sc.ImgFooterButton
                                    onClick={() => setDetailedFlag(!detailedFlag)}
                                >
                                    상세설정(TIF가 아닌 경우)
                                </sc.ImgFooterButton> */}
                                <sc.ImgFooterButton
                                    onClick={async () => {
                                        uploadImage();
                                        console.log(await getInfoFromDB());
                                    }}
                                >
                                    업로드
                                </sc.ImgFooterButton>
                            </div>
                        </sc.ImageListFooter>
                        {/* </div> */}
                    </ImageList>
                </PopupLayer>
            )}
        </>
    );
};
export default EntryPoint;
