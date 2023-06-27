import { useState, useEffect } from 'react';
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
// type SatelliteImage = {
//     name: string;
//     path: string;
// };
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
];
const pos: LatLngExpression = [51.505, -0.09];
const icon = L.icon({
    iconRetinaUrl: icRetina,
    iconUrl: icMarker,
    shadowUrl: shadowImg,
    iconSize: [24, 41],
    iconAnchor: [12, 41],
});
type ImageFile = ArrayBuffer | string | null;
const EntryPoint = (): JSX.Element => {
    /********** State **********
     * flag: Select Image 버튼 플래그
     * // userImage: 선택한 이미지 파일의 이름, 사실상 사용하는 데가 없어서 폐기예정.
     * imageBuffer: 선택한 이미지를 저장할 버퍼.
     * roadData: geojson으로 저장되어 있는 도로 데이터
     * // imageList: DB에서 불러올 이미지 리스트.
     * // filetext: 파일 선택 예시 함수에서 사용함. 폐기할듯.
     ***************************/

    const [flag, setFlag] = useState<boolean>(false);
    const [userImage, setUserImage] = useState<string>('');
    const [imageBuffer, setImageBuffer] = useState<ArrayBuffer | null>(null);
    const [roadData, setRoadData] = useState<string | null>(null);
    const [imageList, setImageList] = useState<File[]>([]);
    const [filetext, setFileText] = useState<string | null | ArrayBuffer>(null);
    // let imageBuffer: ArrayBuffer | null = null;
    // let roadData: string | null = null;

    /* 데모용 이미지 선택 함수 */
    const imageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const fileReader = new FileReader();
        if (e.target.files == null) return;
        fileReader.onload = () => {
            setImageBuffer(fileReader.result as ArrayBuffer);
            setUserImage(e.target.files![0].name);
        };
        fileReader.readAsArrayBuffer(e.target.files[0]);
    };
    /* 데모용 도로 선택 함수 */
    const roadSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const fileReader = new FileReader();
        if (e.target.files == null) return;
        fileReader.onload = () => {
            setRoadData(fileReader.result as string);
            setUserImage(userImage + e.target.files![0].name);
        };
        fileReader.readAsText(e.target.files[0]);
    };
    /* 파일 선택 예시 */
    const fileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const fileReader = new FileReader();
        fileReader.onload = () => {
            console.log(fileReader.result);
            setFileText(fileReader.result);
        };

        if (e.target.files != null) {
            fileReader.readAsText(e.target.files[0]);
        }
        // setImageList(Array.from(e.target.files || []));
    };
    // for debugging
    useEffect(() => {
        console.log(imageList);
    }, [imageList]);
    return (
        <>
            <MapContainer
                id="map"
                style={{ height: '100%', width: '100%' }}
                center={pos}
                zoom={13}
                scrollWheelZoom={true}
            >
                <TileLayer
                    url="https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
                    maxZoom={20}
                    subdomains={['mt1', 'mt2', 'mt3']}
                />
                <Marker position={pos} icon={icon}>
                    <Popup>
                        A pretty CSS3 popup. <br /> Easily customizable.
                    </Popup>
                </Marker>
                {imageBuffer != null && (
                    <GeoImageLayer tifBuffer={imageBuffer} jsonString={null} />
                )}
                {roadData != null && (
                    <GeoImageLayer tifBuffer={null} jsonString={roadData} />
                )}
                {/* {userImage && (
                    <GeoImageLayer tifBuffer={imageBuffer} jsonString={roadData} />
                )} */}
                <LeafletButton
                    title="Select Image"
                    onClick={() => setFlag(true)}
                    position="topright"
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
                        <div>
                            <ImageTable data={example_data} />
                        </div>
                        <sc.HorizontalLine />
                        <div style={{ flexGrow: 1 }}></div>
                        <sc.ImageListFooter>
                            <input type="file" id="uploadImage" onChange={imageSelect} />
                            <input type="file" id="uploadRoad" onChange={roadSelect} />
                            <div>
                                <sc.ImgFooterButton>상세설정</sc.ImgFooterButton>
                                <sc.ImgFooterButton>업로드</sc.ImgFooterButton>
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
