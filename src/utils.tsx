import axios, { Axios } from 'axios';
import { Geometry } from './WktLayer';
// import { generateFeature } from './WktLayer';
const Wkt = require('wicket');
type GeoJSONEdge = {
    type: 'Feature';
    properties: {
        _cost: number;
        _id: number;
    };
    geometry: Geometry;
};
type GeoJSONNetwork = {
    type: 'FeatureCollection';
    features: GeoJSONEdge[];
};
type Pos = [number, number];
class NetworkError extends Error {
    value: number;
    constructor(message: string, index: number) {
        super(message);
        this.value = index;
    }
}

export const API_ENDPOINT = '/api';
type FileType = 'image' | 'geojson' | 'tiles' | 'mask';
// type Extension = 'png' | 'jpg' | 'tif' | 'json';

export const getInfoFromDB = async () => {
    const response = await axios.get<[SateImageInfo]>(`${API_ENDPOINT}/imagelist`);
    // const data = response.data.map((e): SatelliteImageData => {
    //     return
    // })
    return response.data;
};
export function return_API_URL(title: string, t: FileType, sha: string): string;
export function return_API_URL(s: SateImageInfo, t: FileType): string;
export function return_API_URL(
    data: string | SateImageInfo,
    t: FileType,
    sha?: string
): string {
    if (typeof data === 'string') {
        return `${API_ENDPOINT}/${t}/${data}.tif`;
    } else {
        // SateImageInfo
        return `${API_ENDPOINT}/${t}/${data.title}.tif`;
    }
}

export function get_XYZ_URL(s: SateImageInfo): string {
    return `${API_ENDPOINT}/tiles/${s.sha256}/{z}/{x}/{y}.png`;
}

export async function getRoadWktList(sha: string): Promise<Array<string>> {
    const res = await axios.get<string>(`${API_ENDPOINT}/image/${sha}/image.txt`);

    if (res.data.endsWith('\n')) {
        return res.data.slice(0, res.data.length - 1).split('\n');
    }
    return res.data.split('\n');
}
// export function returnDownloadURL(type: FileType, title: string, sha: string) {
//     const endpoint = type === 'img' ? 'image' : 'geojson';
//     const t = title.split('.');
//     const ext = t[t.length - 1];
//     return `${API_ENDPOINT}/${endpoint}/${sha}.${ext}`;
// };

// export function returnDownloadURL(s: SateImageInfo) {}

export const Info2TableData = (l: [SateImageInfo]) => {
    return l.map((e): SatelliteImageData => {
        return {
            name: e.title,
            uri: return_API_URL(e.title, 'image', e.sha256),
            location: e.location,
            size: e.size,
        };
    });
};
type ImageChunk = {
    index: number;
    data: Blob;
};
// async function upload_chunk(url: string, chunk: Blob, index: number) {
async function upload_chunk(url: string, chunk: ImageChunk) {
    const formData = new FormData();
    formData.append('index', chunk.index.toString());
    formData.append('file', chunk.data);
    try {
        const response = await axios.post(url, formData);
        console.log(`${chunk.index} chunk sended: ${response.data}`);
        return { status: 'fulfilled', value: chunk.index };
    } catch (err) {
        throw new NetworkError('error while sending chunk', chunk.index);
    }
}
export function sliceFile(file: File, chunkSize: number): ImageChunk[] {
    const slice_arr = [];
    let start = 0;

    while (start < file.size) {
        const end = Math.min(file.size, start + chunkSize);
        const slice = file.slice(start, end);
        slice_arr.push(slice);
        start = end;
    }
    return slice_arr.map((c, i): ImageChunk => {
        return { index: i, data: c };
    });
}
export function uploadChunks(
    url: string,
    chunks: ImageChunk[],
    callback: Function = () => {},
    target_index: Array<number> = []
) {
    if (target_index.length == 0) {
        const responses = Promise.allSettled(
            chunks.map(async (c, i) => {
                const result = await upload_chunk(url, c);
                callback();
                return result;
            })
        );
        return responses;
    } else {
        const filtered = chunks.filter((ch) => target_index.includes(ch.index));
        const responses = Promise.allSettled(
            filtered.map(async (c, i) => {
                const result = await upload_chunk(url, c);
                callback();
                return result;
            })
        );
        return responses;
    }
    // const responses = Promise.allSettled(
    //     chunks.map(async (c, i) => {
    //         return await upload_chunk(url, c, i);
    //     })
    // );
}

// function generateFeatures(geometry: Geometry, readCallback, ): GeoJSONEdge[] {
//     const len = geometry.coordinates.length;
//     let result: GeoJSONEdge[] = [];
//     // let result: GeoJSONEdge = {
//     //     type: "Feature",

//     // }
//     for (let i=0; i<len-1; i++) {
//         const data: GeoJSONEdge = {
//             type: "Feature",
//             properties: {
//                 _id:
//             },
//             geometry: {
//                 type: "LineString",
//                 coordinates: [ geometry.coordinates[i], geometry.coordinates[i+1] ]
//             }
//         }
//         result.push(data);
//     }
// }
function featureMaker(id: number, cost: number, geometry: Geometry): GeoJSONEdge {
    return {
        type: 'Feature',
        properties: {
            _id: id,
            _cost: cost,
        },
        geometry: geometry,
    };
}
function calcDistance(x: Pos, y: Pos): number {
    return Math.sqrt(
        Math.pow(Math.abs(x[0] - y[0]), 2) + Math.pow(Math.abs(x[1] - y[1]), 2)
    );
}
export function wkt2Network(wkt: string[]): GeoJSONNetwork {
    const geojson: GeoJSONNetwork = {
        type: 'FeatureCollection',
        features: new Array<GeoJSONEdge>(),
    };
    let id = 1;

    wkt.forEach((w, i) => {
        const wktObj = new Wkt.Wkt();
        wktObj.read(w);
        const old_geometry: Geometry = wktObj.toJson();
        for (let i = 0; i < old_geometry.coordinates.length - 1; i++) {
            const from: Pos = old_geometry.coordinates[i];
            const to: Pos = old_geometry.coordinates[i + 1];
            const cost = calcDistance(from, to);
            const geometry: Geometry = {
                type: 'LineString',
                coordinates: [from, to],
            };
            geojson.features.push(featureMaker(id++, cost, geometry));
        }
        // const newFeature = generateFeatures(wktObj.toJson());
        // geojson.features.push(newFeature);
        // geojson.features.push(wktObj.toJson());
    });
    return geojson;
}

export async function check_upload_files(): Promise<Array<number>> {
    return (await axios.get(`${API_ENDPOINT}/uploaded_chunks`)).data;
}
const utils = {
    getInfoFromDB,
    return_API_URL,
    Info2TableData,
    sliceFile,
    uploadChunks,
    check_upload_files,
    wkt2Network,
    getRoadWktList,
};

export default utils;
