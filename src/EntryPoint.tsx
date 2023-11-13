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
import utils, { getInfoFromDB, return_API_URL, get_XYZ_URL, uploadChunks } from './utils';
import axios from 'axios';
import WktLayer from './WktLayer';

// type SatelliteImage = {
//     name: string;
//     path: string;
// };
const API_UPLOAD = '/api/uploadimage_test';
const infoName = ['Latitude', 'Longitude', 'Width', 'Height'];
const pos: LatLngExpression = [36.4768, 127.3745];
const icon = L.icon({
    iconRetinaUrl: icRetina,
    iconUrl: icMarker,
    shadowUrl: shadowImg,
    iconSize: [24, 41],
    iconAnchor: [12, 41],
});
// [경도, 위도] 좌표임!!!!!!!!!
const example_wkt_ = `LINESTRING (127.3751 36.5264, 127.3751 36.5045, 127.3636 36.4905, 127.3828 36.4814)`;
const example_wkt = `LINESTRING (127.3289 36.5053, 127.3485 36.5059, 127.3595 36.5143, 127.3751 36.5045, 127.3976 36.5154, 127.4065 36.4992, 127.4228 36.4988)`;
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
     * uploadProgress: 분할 업로드 프로그레스.
     ***************************/

    const [flag, setFlag] = useState<boolean>(false);
    const [userImage, setUserImage] = useState<string>('');
    const [imagePointer, setImagePointer] = useState<File | null>(null);
    // const [roadData, setRoadData] = useState<string | null>(null);
    const [imageList, setImageList] = useState<Array<SateImageInfo>>([]);
    // const [filetext, setFileText] = useState<string | null | ArrayBuffer>(null);
    const [detailedFlag, setDetailedFlag] = useState<boolean>(false);

    const [targetImage, setTargetImage] = useState<number | null>(null);
    const [uploadProgress, setUploadProgress] = useState<number>(0);

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
    }, []);
    const uploadImage = useCallback(async () => {
        if (imagePointer != null) {
            const is_busy = await axios.get('/api/r_u_busy');
            if (is_busy.data == true) {
                alert('the server is busy... try it later.');
                return;
            }
            const chunkSize = 1024 * 1024;
            const nChunks = Math.ceil(imagePointer.size / chunkSize);
            const sliced = utils.sliceFile(imagePointer, chunkSize);
            let watch = 0;
            const increaseWatch = () => {
                setUploadProgress(Math.floor((++watch / nChunks) * 100));
            };
            // const watch_progress = setInterval(async () => {
            //     const uploaded = await utils.check_upload_files();
            //     setUploadProgress(Math.floor((uploaded.length / nChunks) * 100));
            // }, 100);
            utils
                .uploadChunks('/api/upload_chunk', sliced, increaseWatch)
                .then(async (arr) => {
                    let rest = sliced;
                    let failed = arr.filter((response) => response.status === 'rejected');
                    let count = 0;
                    while (failed.length != 0) {
                        console.log('Resend count: ', count++);
                        console.log('failed while chunk sending. Retrying.');
                        const uploaded = await utils.check_upload_files();
                        rest = rest.filter((chunk) => !uploaded.includes(chunk.index));
                        arr = await uploadChunks(
                            '/api/upload_chunk',
                            rest,
                            increaseWatch
                        );
                        failed = arr.filter((response) => response.status === 'rejected');
                    }
                    // clearInterval(watch_progress);
                    setUploadProgress(100);
                    const merge_res = await axios.get(
                        `/api/merge_files_caller?title=${imagePointer.name}&chunk_size=${nChunks}`
                    );
                    console.log('Merge request: ', merge_res.status);
                })
                .catch((reason) => console.error(reason));
        } else alert('Please select tif image');
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
                {targetImage != null && imageList[targetImage] && (
                    <TileLayer
                        url={get_XYZ_URL(imageList[targetImage])}
                        maxZoom={20}
                        opacity={0.5}
                    />
                )}
                <MapEvents />
                {/* <Marker position={pos} icon={icon}>
                    <Popup>
                        A pretty CSS3 popup. <br /> Easily customizable.
                    </Popup>
                </Marker> */}
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
                <WktLayer wkt={[example_wkt, example_wkt_]} />
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
                            {uploadProgress > 0 && (
                                <div style={{ backgroundColor: 'skyblue' }}>
                                    {uploadProgress}%
                                </div>
                                // upload progress bar.
                            )}
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
