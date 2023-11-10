import axios from 'axios';

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
    target_index: Array<number> = []
) {
    if (target_index.length == 0) {
        const responses = Promise.allSettled(
            chunks.map(async (c, i) => {
                return await upload_chunk(url, c);
            })
        );
        return responses;
    } else {
        const filtered = chunks.filter((ch) => target_index.includes(ch.index));
        const responses = Promise.allSettled(
            filtered.map(async (c, i) => {
                return await upload_chunk(url, c);
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
};

export default utils;
