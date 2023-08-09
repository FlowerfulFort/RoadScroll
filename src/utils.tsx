import axios from 'axios';

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

const utils = {
    getInfoFromDB,
    return_API_URL,
    Info2TableData,
};
export default utils;
