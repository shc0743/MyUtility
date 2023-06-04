
import { engine, engine as player } from './player.js';


export async function play(el, url) {
    try {
        const header = await fetch(url, { method: 'HEAD' });
        if (!header.ok) throw new Error(`HTTP Error ${header.status} : ${header.statusText}`);
        const type = header.headers.get('content-type');
        const eng = engine[type];
        if (!eng) {
            return cannotplay();
        }
        el.innerHTML = '';
        return eng.call(this, url, el);
    } catch (err) { throw err }
}

export async function playqueue([el, progressTextEl, progressBarEl, pauseButton, nextButton, prevButton, rapidEl], queue, dieEvent) {
    let index = 0, count = queue.length;
    const sym_exit = Symbol('Exit loop'), sym_next = Symbol('Next'), sym_prev = Symbol('previous');
    if (count < 1) return false;
    for (; (index >= count && ((index = 0))) || true; ++index) {
        try {
            const media = await play(el, queue[index]);
            if (!media instanceof HTMLMediaElement) throw new TypeError('Invalid type was returned');
            try {
                await Promise.race([new Promise((resolve, reject) => {
                    media.addEventListener('ended', resolve, { once: true });
                    media.addEventListener('error', reject, { once: true });
                    pauseButton && (pauseButton.onclick = () => {
                        media[media.paused ? 'play' : 'pause']();
                    });
                    let lastCurTime = -1;
                    let duration = -1, durationText = null;
                    if (progressTextEl) media.addEventListener('timeupdate', () => {
                        const floored = Math.floor(media.currentTime);
                        if (lastCurTime === floored) return;
                        lastCurTime = floored;
                        if (duration !== media.duration || (!durationText)) {
                            durationText = formattime(media.duration);
                            duration = media.duration;
                        }
                        progressTextEl.innerText = `${formattime(floored)} / ${durationText}`;
                        progressBarEl && (progressBarEl.value = floored);
                    });
                    if (progressBarEl) {
                        progressBarEl.disabled = false;
                        media.addEventListener('playing', () => {
                            progressBarEl.min = 0, progressBarEl.max = Math.floor(media.duration), progressBarEl.value = 0;
                        }, { once: true });
                        progressBarEl.onchange = () => {
                            media.currentTime = progressBarEl.value;
                            media.play();
                        };
                        progressBarEl.oninput = () => {
                            ((!media.paused) && (media.pause()));
                            if (progressTextEl) {
                                if (duration !== media.duration || (!durationText)) {
                                    durationText = formattime(media.duration);
                                    duration = media.duration;
                                }
                                progressTextEl.innerText = `${formattime(progressBarEl.value)} / ${durationText}`;
                            }
                        };
                    }
                    if (rapidEl) {
                        let oldvalue = 1;
                        const fn = () => {
                            try {
                                media.playbackRate = rapidEl.value;
                                oldvalue = rapidEl.value;
                            } catch {
                                media.playbackRate = rapidEl.value = oldvalue;
                            }
                        };
                        rapidEl.onchange = fn;
                        media.addEventListener('playing', fn, { once: true });
                    }
                    nextButton && (nextButton.disabled = false); prevButton && (prevButton.disabled = false);
                }), new Promise((_0, reject) => {
                    dieEvent.then(_0).catch(() => reject(sym_exit));
                    nextButton && (nextButton.onclick = () => { nextButton.disabled = true, reject(sym_next) });
                    prevButton && (prevButton.onclick = () => { prevButton.disabled = true, reject(sym_prev) });
                })]);
                await new Promise(r => setTimeout(r, 500));
            } catch (error) {
                if (error === sym_exit) {
                    el.innerHTML = '';
                    progressTextEl && (progressTextEl.innerText = '');
                    progressBarEl && ((progressBarEl.onchange = progressBarEl.oninput = null), (progressBarEl.disabled = true), (progressBarEl.min = 0, progressBarEl.max = 1, progressBarEl.value = 0));
                    pauseButton && (pauseButton.onclick = null);
                    nextButton && (nextButton.onclick = null, nextButton.disabled = true);
                    prevButton && (prevButton.onclick = null, prevButton.disabled = true);
                    return true;
                }
                if (error === sym_next || error === sym_prev) {
                    if (error === sym_prev) index -= 2;
                    index < 0 && (index = count - 2);
                    index >= count && (index = 0);
                    continue;
                }
                console.error('[player]', error);
                await new Promise(r => setTimeout(r, 2000));
            }
        }
        catch (error) {
            console.warn('Error during playing:', error);
            await new Promise(r => setTimeout(r, 1000));
        }
    }
    return null;
}

export function cannotplay() {
    return new Promise(r => setTimeout(r, 5000));
}

export function formattime(n) {
    n = Math.floor(n);
    if (n < 60) return '0:' + fillzero(n);
    if (n < 3600) return Math.floor(n / 60) + ':' + fillzero(n % 60);
    return `${Math.floor(n / 3600)}:${fillzero(Math.floor((n % 3600) / 60))}:${fillzero(n % 60)}`;
}
export function fillzero(n, c = 2) {
    let str = String(n);
    while (str.length < c) str = '0' + str;
    return str;
}

