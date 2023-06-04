export const engine = {
    'audio/mp3': AudioPreview,
    'video/mp4': VideoPreviewNative,
    'video/webm': VideoPreviewNative,
    'video/ogg': VideoPreviewNative,
    'video/mov': VideoPreviewNative,
    'video/x-flv': VideoPreviewFlv,
    'video/mkv': VideoPreviewFlv,
};


function canplayHandler(el, area) {
    const canPlayPromise = new Promise((resolve, reject) => {
        area.addEventListener('error', reject, { once: true });
        area.addEventListener('canplay', resolve, { once: true });
        el.append(area);
    });

    canPlayPromise.then(() => {
        area.play();
    }).catch(console.warn);
}

export function AudioPreview(url, el) {
    const area = document.createElement('audio');
    area.setAttribute('style', 'width: 100%; height: 100%;');
    area.src = url.href;
    area.controls = true;
    canplayHandler(el, area);
    return area;
}

export async function VideoPreviewFlv(url, el) {
    const area = document.createElement('video');
    area.setAttribute('style', 'width: 100%; height: 100%;');
    area.controls = true;
    area.playsInline = true;
    area.crossOrigin = 'anonymous';
    area.autoplay = true;
    el.append(area);

    const NOFLVJS = Symbol('NO Flv.JS');
    if (NOFLVJS === await (async function () {
        try {
            const resp = await fetch(url, { headers: { range: 'bytes=0-8' } });
            if (!resp.ok) throw resp;
            const data = new Uint8Array(await resp.arrayBuffer());
            if (data[0] !== 0x46 || data[1] !== 0x4C || data[2] !== 0x56 || data[3] !== 0x01) {
                // flv.js doesn't support,  try native
                area.src = url.href;
                return NOFLVJS;
            }
        } catch { return }
    })()) return;

    if (!globalThis.flvjs || !flvjs.isSupported()) {
        return area.outerHTML = `<b>Sorry but your browser doesn't support FLV video playing.</b>`;
    }
    const preview__data = flvjs.createPlayer({
        type: 'flv',
        url: url
    });
    preview__data.attachMediaElement(area);
    preview__data.load();
    // preview__data.play();

    globalThis.userdata.get('config', 'file.preview.media.autoplay').then(value => {
        if (value !== true && value !== false) return userdata.put('config', false, 'file.preview.media.autoplay');
        if (value) preview__data.play();
    }).catch(console.warn);

    return area;
}
export function VideoPreviewNative(url, el) {
    const area = document.createElement('video');
    area.setAttribute('style', 'width: 100%; height: 100%;');
    area.controls = true;
    area.playsInline = true;
    area.crossOrigin = 'anonymous';
    area.src = url.href;
    canplayHandler(el, area);
    return area;
}

