

import { registerResizableWidget } from "./BindMove.js";

registerResizableWidget('my-widget');



for (const i of document.querySelectorAll('my-widget .close-widget')) {
    i.onclick = function () {
        this.parentElement.parentElement.close();
    };
    i.dataset.excludeBindmove = '';
}



playctl.addEventListener('pointerout', (ev) => ev.target === playctl && playctl.classList.contains('active') && playctl.classList.remove('active'));



import { el } from "./util/element.js";
let playlist = new Array;
const plupdate = function () {
    playlist_items.innerHTML = '';
    if (playlist.length === 0) {
        return playlist_items.previousElementSibling.hidden = false;
    } playlist_items.previousElementSibling.hidden = true;
    for (let I = 0, L = playlist.length; I < L; ++I) {
        const i = playlist[I];
        const div = el.div, lb = el.label;
        const span = el.span;
        const [box] = el[1]('input', { type: 'checkbox' });
        div.dataset.n = I;
        box.ref = div;
        div.className = 'pl-item'; box.className = 'pl-item-box';span.className = 'mg-right-05em';
        span.innerText = i.href;
        lb.append(box, span); div.append(lb);
        playlist_items.append(div);
    }
};
const pladd = function (urls) {
    for (const i of urls) try {
        const url = new URL(i);
        playlist.push(url);
    } catch {}
    plupdate();
};



pl_add.onclick = () => { playlist_add.open = true; playlist_addtext.value = ''; };

pl_addbtn.onclick = function () {
    const text = playlist_addtext.value;
    this.disabled = true;
    setTimeout(() => {
        const rows = text.split('\n').filter(el => el && el.trim() != '');
        pladd(rows);
        playlist_add.open = this.disabled = false;
    }, 1000);
};

pl_delete.onclick = function () {
    const checked = playlist_items.querySelectorAll('.pl-item .pl-item-box:checked');
    const needDelete = new Set();
    for (const i of checked) {
        const el = i.ref;
        const n = +el.dataset.n;
        if (isNaN(n)) continue;
        needDelete.add(n);
    }
    playlist = playlist.filter((_0, index) => (!needDelete.has(index)));
    plupdate();
};

playctl_fixed.onclick = function () {
    this.classList.toggle('is-active');
    if (this.classList.contains('is-active')) {
        playctl.classList.add('active'); playctl.classList.add('always-active');
    } else {
        playctl.classList.remove('active'); playctl.classList.remove('always-active');
    }
};

playlist_add.ondragover = pl_add.ondragover = function (ev) {
    if (ev.dataTransfer?.items?.length == 0 || ev.dataTransfer?.items?.length == undefined) return;
    ev.dataTransfer.dropEffect = 'move';
    ev.preventDefault();
};

playlist_add.ondrop = pl_add.ondrop = async function (ev) {
    if (ev.dataTransfer?.files?.length == 0 || ev.dataTransfer?.files?.length == undefined) return;
    ev.preventDefault();
    const texts = [];
    const files = ev.dataTransfer.files;
    console.log(files);
    for (const i of files) {
        if (i.size > 1048576) continue;
        const rows = (await i.text()).trim().split('\n').filter(el => el && el.trim() != '');
        if (rows.length) texts.push.apply(texts, rows);
    }
    pladd(texts);
};





import { playqueue } from './play.js';

let stopplay = null;
const onstartplay = function () {
    if (playlist.length < 1) return alert('No Item');

    startPlay.onclick = onstopplay;
    startPlay.classList.add('started');
    
    playqueue([
        video_container, p_progress, p_pbar, pause, next, prev, playSpeed,
    ], playlist, new Promise((_0, reject) => {
        stopplay = reject;
    }));
};
const onstopplay = function () {
    startPlay.onclick = onstartplay;
    startPlay.classList.remove('started');
    stopplay && stopplay('User stopped playing.');
};
startPlay.onclick = onstartplay;





launch.onclick = function () {
    player.classList.add('active');
};
launch.disabled = false;
launch.innerText = 'GO!';

if (new(URL)(location).searchParams.get('autorun') === 'true') queueMicrotask(() => launch.click());




import('./keyboard_shortcuts.js').then((moduleHandle) => {
    const { default: ks, NoPrevent } = moduleHandle;
    globalThis.addEventListener('keydown', function (ev) {
        const keys = [];
        if (ev.ctrlKey && ev.key !== 'Control') keys.push('Ctrl');
        if (ev.altKey && ev.key !== 'Alt') keys.push('Alt');
        if (ev.shiftKey && ev.key !== 'Shift') keys.push('Shift');
        keys.push(ev.key.length === 1 ? ev.key.toUpperCase() : ev.key);
        const key = keys.join('+');

        const fn = ks[key];
        if (fn) {
            const ret = fn.call(globalThis, ev, key);
            if (ret !== NoPrevent) ev.preventDefault();
        }
        return;
    });
});



